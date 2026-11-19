"""v2 storage layout in Chroma: documents are first-class, chunks point at them.

  {user}_v2_documents   id = doc_id         embedding = doc card (title+summary+keywords)   metadata = labels
  {user}_v2_chunks      id = {doc_id}:{n}   embedding = chunk text                            metadata = doc_id, doc_type, page

Lives next to v1's `{user}_docs`, so v1 keeps working during migration.

Invariant this class owns: every chunk belongs to an existing document. Chroma has no
transactions across collections, so writes go chunks -> document and deletes go
chunks -> document. A failure midway leaves at worst a document with no chunks
(harmless, retryable), never orphan chunks that keep showing up in search.
"""

import uuid
from collections.abc import Callable, Sequence

from retrieval import config
from retrieval.schemas import DocumentRecord
from retrieval.taxonomy import Category, DocType

EmbedFn = Callable[[list[str]], list[list[float]]]

# OpenAI embeddings cap tokens per request; chunks are ~400 tokens, so 100/batch stays well under.
EMBED_BATCH_SIZE = 100


def _default_embed(texts: list[str]) -> list[list[float]]:
    # Lazy import: agent.embedder builds an OpenAI client at import time.
    from agent.embedder import embed_text_batch

    return embed_text_batch(texts)


def new_doc_id() -> str:
    return uuid.uuid4().hex


def _join(items: Sequence[str]) -> str:
    """Chroma metadata can't hold lists -> store as comma-joined strings."""
    return ",".join(i.replace(",", " ").strip() for i in items if i.strip())


def _split(value: str | None) -> list[str]:
    return [v for v in (value or "").split(",") if v]


class DocumentStore:
    def __init__(self, client, user_id: str, embed_fn: EmbedFn | None = None):
        """client = chromadb client (persistent HttpClient, in-memory guest client, or a test client).
        embed_fn defaults to agent.embedder.embed_text_batch; inject a fake one in tests."""
        safe_user = user_id.replace("|", "")
        self._embed_fn = embed_fn or _default_embed
        cosine = {"hnsw:space": "cosine"}
        self.documents = client.get_or_create_collection(f"{safe_user}{config.DOCUMENTS_SUFFIX}", metadata=cosine)
        self.chunks = client.get_or_create_collection(f"{safe_user}{config.CHUNKS_SUFFIX}", metadata=cosine)

    # ------------------------------------------------------------------ writes

    def add_document(self, record: DocumentRecord, chunks: list[dict]) -> None:
        """chunks = output of parser.pdf_parser.parse_pdf (dicts with text/page/chunk_index).
        Upserts, so re-adding the same doc_id overwrites instead of failing."""
        texts = [c["text"] for c in chunks]
        card = record.card_text()
        embeddings = self.embed([card, *texts])
        record.embedding = embeddings[0]

        # 1) chunks first ...
        if texts:
            self.chunks.upsert(
                ids=[f"{record.doc_id}:{i}" for i in range(len(texts))],
                embeddings=embeddings[1:],
                documents=texts,
                metadatas=[
                    {
                        "doc_id": record.doc_id,
                        "title": record.title,
                        "doc_type": record.doc_type.value,
                        "category": record.category.value,
                        "page": c.get("page"),
                        "seq": i,  # order within the whole document (chunk_index resets per page)
                    }
                    for i, c in enumerate(chunks)
                ],
            )
        # 2) ... document row last, so a doc only "exists" once its content does.
        self.documents.upsert(
            ids=[record.doc_id],
            embeddings=[record.embedding],
            documents=[card],
            metadatas=[self._to_metadata(record)],
        )

    def delete_document(self, doc_id: str) -> None:
        # Chunks first: a failure here leaves everything intact; a failure after leaves an
        # empty doc row (retryable) rather than orphan chunks that still show up in lookups.
        self.chunks.delete(where={"doc_id": doc_id})
        self.documents.delete(ids=[doc_id])

    # ------------------------------------------------------------------ reads

    def count(self) -> int:
        return self.documents.count()

    def get_documents(
        self,
        doc_types: Sequence[DocType] | None = None,
        categories: Sequence[Category] | None = None,
        ids: Sequence[str] | None = None,
    ) -> list[DocumentRecord]:
        """Metadata filter over documents: doc_types OR categories. No filters = all docs."""
        clauses = []
        if doc_types:
            clauses.append({"doc_type": {"$in": [DocType(d).value for d in doc_types]}})
        if categories:
            clauses.append({"category": {"$in": [Category(c).value for c in categories]}})
        where = None if not clauses else clauses[0] if len(clauses) == 1 else {"$or": clauses}

        res = self.documents.get(
            ids=list(ids) if ids else None, where=where, include=["metadatas", "embeddings"]
        )
        embeddings = res["embeddings"] if res["embeddings"] is not None else [None] * len(res["ids"])
        return [self._from_metadata(i, m, e) for i, m, e in zip(res["ids"], res["metadatas"], embeddings)]

    def get_document_by_title(self, title: str) -> DocumentRecord | None:
        """Bridge for the v1 routes, which identify docs by title (/delete, /replace, /update-tags)."""
        res = self.documents.get(where={"title": title}, limit=1, include=["metadatas", "embeddings"])
        if not res["ids"]:
            return None
        return self._from_metadata(res["ids"][0], res["metadatas"][0], res["embeddings"][0])

    def get_document_chunks(self, doc_id: str) -> list[dict]:
        """All chunks of one document in reading order."""
        res = self.chunks.get(where={"doc_id": doc_id}, include=["documents", "metadatas"])
        rows = [{"id": i, "text": t, **m} for i, t, m in zip(res["ids"], res["documents"], res["metadatas"])]
        return sorted(rows, key=lambda r: r["seq"])

    def search_chunks(
        self, query_embedding: list[float], n_results: int, doc_ids: Sequence[str] | None = None
    ) -> list[dict]:
        """Vector search over chunks, optionally restricted to some documents.
        Returns dicts with text, similarity (cosine, higher = better) and the chunk metadata."""
        where = {"doc_id": {"$in": list(doc_ids)}} if doc_ids else None
        res = self.chunks.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=where,
            include=["documents", "metadatas", "distances"],
        )
        return [
            {"id": i, "text": t, "similarity": 1 - d, **m}
            for i, t, m, d in zip(res["ids"][0], res["documents"][0], res["metadatas"][0], res["distances"][0])
        ]

    # ------------------------------------------------------------------ helpers

    def embed(self, texts: list[str]) -> list[list[float]]:
        out: list[list[float]] = []
        for start in range(0, len(texts), EMBED_BATCH_SIZE):
            out.extend(self._embed_fn(texts[start : start + EMBED_BATCH_SIZE]))
        return out

    @staticmethod
    def _to_metadata(r: DocumentRecord) -> dict:
        return {
            "title": r.title,
            "doc_type": r.doc_type.value,
            "category": r.category.value,
            "summary": r.summary,
            "keywords": _join(r.keywords),
            "entities": _join(r.entities),
            "user_tags": _join(r.user_tags),
            "document_date": r.document_date,
            "contains_multiple_items": r.contains_multiple_items,
            "page_count": r.page_count,
        }

    @staticmethod
    def _from_metadata(doc_id: str, m: dict, embedding) -> DocumentRecord:
        return DocumentRecord(
            doc_id=doc_id,
            title=m["title"],
            doc_type=DocType(m["doc_type"]),
            category=Category(m["category"]),
            summary=m.get("summary") or "",
            keywords=_split(m.get("keywords")),
            entities=_split(m.get("entities")),
            user_tags=_split(m.get("user_tags")),
            document_date=m.get("document_date"),
            contains_multiple_items=bool(m.get("contains_multiple_items")),
            page_count=m.get("page_count"),
            embedding=list(embedding) if embedding is not None else None,
        )
