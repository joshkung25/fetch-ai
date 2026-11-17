"""v2 storage layout in Chroma: documents are first-class, chunks point at them.

  {user}_v2_documents   id = doc_id         embedding = doc card (title+summary+keywords)   metadata = labels
  {user}_v2_chunks      id = {doc_id}:{n}   embedding = chunk text                            metadata = doc_id, doc_type, page

Lives next to v1's `{user}_docs`, so v1 keeps working during migration.
Notes: use cosine space (metadata={"hnsw:space": "cosine"}); Chroma metadata can't hold
lists, so keywords/tags get stored as comma-joined strings.
"""

from retrieval.schemas import DocumentRecord
from retrieval.taxonomy import Category, DocType


class DocumentStore:
    def __init__(self, client, user_id: str):
        """client = chromadb client (persistent HttpClient, or in-memory for guests/tests)."""
        raise NotImplementedError

    def add_document(self, record: DocumentRecord, chunks: list[dict]) -> None:
        raise NotImplementedError

    def delete_document(self, doc_id: str) -> None:
        raise NotImplementedError

    def get_documents(
        self, doc_types: list[DocType] | None = None, categories: list[Category] | None = None
    ) -> list[DocumentRecord]:
        """Metadata filter over documents (no filters = all docs)."""
        raise NotImplementedError

    def search_chunks(self, query_embedding: list[float], n_results: int, doc_ids: list[str] | None = None) -> list[dict]:
        raise NotImplementedError
