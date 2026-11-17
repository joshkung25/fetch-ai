"""Entry points for v2. See docs/v2-architecture.md for the flow.

    upload time:  parse_pdf -> label_document -> store.add_document
    chat time:    parse_query -> route -> strategy (uses ranker) -> context -> LLM answer
"""

from retrieval.schemas import DocumentRecord, RetrievalResult
from retrieval.store import DocumentStore


def ingest_document(store: DocumentStore, title: str, chunks: list[dict], user_tags: list[str] | None = None) -> DocumentRecord:
    raise NotImplementedError


def retrieve(store: DocumentStore, query: str, history: list[dict] | None = None) -> RetrievalResult:
    raise NotImplementedError
