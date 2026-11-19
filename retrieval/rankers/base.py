"""The plug-in point for ranking models (e.g. the BM25F + vector hybrid built for IR class).

A Ranker is a pure function over an in-memory candidate set: it never touches Chroma or the
network. Per-user corpora are small (tens to hundreds of docs), so building term statistics
on the fly / caching them per user is fine. This keeps the class project portable: implement
`rank()` against these plain objects and drop it in.

What a ranker gets for each candidate (RankableDocument):
  * `fields`   - named text fields for fielded models like BM25F
                 (title, doc_type, summary, keywords, entities, and optionally body)
  * `embedding`- doc-level embedding of the document card (for the vector half of a hybrid)
And for the query (ParsedQuery): raw_query, search_query (LLM rewrite), keywords, target labels.
"""

from dataclasses import dataclass
from typing import Protocol, Sequence

from retrieval.schemas import DocumentRecord, ParsedQuery, ScoredDocument


@dataclass
class RankableDocument:
    record: DocumentRecord
    fields: dict[str, str]
    embedding: list[float] | None

    @classmethod
    def from_record(cls, record: DocumentRecord, body: str | None = None) -> "RankableDocument":
        fields = record.fields()
        if body is not None:
            fields["body"] = body
        return cls(record=record, fields=fields, embedding=record.embedding)


class Ranker(Protocol):
    name: str

    def rank(
        self,
        query: ParsedQuery,
        candidates: Sequence[RankableDocument],
        *,
        query_embedding: list[float] | None = None,
    ) -> list[ScoredDocument]:
        """Return candidates sorted by descending score. Scores should be comparable to a
        fixed threshold (normalize if your model's raw scores aren't), because enumeration
        uses a cutoff rather than top-k."""
        ...
