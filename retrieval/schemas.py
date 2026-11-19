"""Data models for the v2 retrieval pipeline.

Two kinds of models live here:
  * Output models (`...Output`) are what the LLM returns via structured outputs. OpenAI strict
    mode requires every field to be required and no defaults, so keep them that way.
  * Everything else is internal and can have defaults.
"""

from dataclasses import dataclass, field
from enum import StrEnum

from pydantic import BaseModel, Field

from retrieval.taxonomy import Category, DocType

# ---------------------------------------------------------------------------
# Ingest: document labeling
# ---------------------------------------------------------------------------


class DocumentLabelOutput(BaseModel):
    """LLM output for labeling one uploaded document."""

    doc_type: DocType
    summary: str = Field(description="2-3 sentence factual summary of what the document is and contains")
    keywords: list[str] = Field(description="5-15 lowercase search keywords, including synonyms a user might type")
    entities: list[str] = Field(description="named people, organizations, places, products, medications, courses")
    document_date: str | None = Field(description="primary date of the document as YYYY-MM-DD, or null if unclear")
    contains_multiple_items: bool = Field(
        description="true if the document bundles many separate items of its type (e.g. a cookbook with many recipes, a pharmacy printout with many prescriptions)"
    )


@dataclass
class DocumentRecord:
    """A document as stored in the `{user}_v2_documents` collection."""

    doc_id: str
    title: str
    doc_type: DocType
    category: Category
    summary: str
    keywords: list[str]
    entities: list[str]
    document_date: str | None
    contains_multiple_items: bool
    user_tags: list[str] = field(default_factory=list)
    page_count: int | None = None
    embedding: list[float] | None = None  # embedding of the document card, filled by the store

    def card_text(self) -> str:
        """Text that represents the whole document for doc-level embedding / ranking."""
        return "\n".join(
            [
                f"Title: {self.title}",
                f"Type: {self.doc_type.value} ({self.category.value})",
                f"Summary: {self.summary}",
                f"Keywords: {', '.join(self.keywords + self.user_tags)}",
                f"Entities: {', '.join(self.entities)}",
            ]
        )

    def fields(self) -> dict[str, str]:
        """Named fields for fielded ranking models (BM25F). Body text is attached separately."""
        return {
            "title": self.title,
            "doc_type": f"{self.doc_type.value} {self.category.value}",
            "summary": self.summary,
            "keywords": " ".join(self.keywords + self.user_tags),
            "entities": " ".join(self.entities),
        }


# ---------------------------------------------------------------------------
# Query time: parsing + routing
# ---------------------------------------------------------------------------


class QueryIntent(StrEnum):
    GENERAL = "general"  # no personal docs needed ("write a cover letter template")
    LOOKUP = "lookup"  # a specific fact ("what's my gpa") -> precision, top-k chunks
    ENUMERATE = "enumerate"  # every matching doc ("all my recipes") -> coverage / recall
    SINGLE_DOCUMENT = "single_document"  # one whole doc ("summarize my lease")


class ParsedQueryOutput(BaseModel):
    """LLM output for parsing a user query. Also decides the route (intent)."""

    intent: QueryIntent
    doc_types: list[DocType] = Field(description="document types the answer most likely lives in; empty if unsure")
    categories: list[Category] = Field(description="broader categories, used when no specific doc_type fits")
    search_query: str = Field(description="standalone, keyword-rich rewrite of the query for search engines")
    keywords: list[str] = Field(description="important lowercase terms and synonyms for lexical matching")
    document_hint: str | None = Field(
        description="for single_document: how the user referred to the doc (e.g. 'my lease'), else null"
    )


@dataclass
class ParsedQuery:
    raw_query: str
    intent: QueryIntent
    doc_types: list[DocType]
    categories: list[Category]
    search_query: str
    keywords: list[str]
    document_hint: str | None

    @classmethod
    def from_output(cls, raw_query: str, out: ParsedQueryOutput) -> "ParsedQuery":
        return cls(raw_query=raw_query, **out.model_dump())

    @property
    def has_label_targets(self) -> bool:
        return bool(self.doc_types or self.categories)


class Strategy(StrEnum):
    NONE = "none"
    CHUNK_TOP_K = "chunk_top_k"
    ENUMERATE_DOCS = "enumerate_docs"
    WHOLE_DOCUMENT = "whole_document"


@dataclass
class RoutePlan:
    strategy: Strategy
    reason: str


# ---------------------------------------------------------------------------
# Ranking + results
# ---------------------------------------------------------------------------


@dataclass
class ScoredDocument:
    doc: DocumentRecord
    score: float
    matched_by: set[str] = field(default_factory=set)  # e.g. {"label", "vector", "bm25f"}


@dataclass
class ContextBlock:
    """One unit of retrieved context handed to the answering LLM."""

    doc_id: str
    title: str
    text: str
    score: float | None = None
    page: int | None = None


@dataclass
class RetrievalResult:
    query: ParsedQuery
    plan: RoutePlan
    contexts: list[ContextBlock]

    @property
    def source_titles(self) -> list[str]:
        seen: dict[str, None] = {}
        for c in self.contexts:
            seen.setdefault(c.title, None)
        return list(seen)
