"""Upload-time entry point. See docs/v2-architecture.md for the flow.

    parse_pdf -> label_document -> store.add_document
"""

from retrieval.schemas import DocumentRecord
from retrieval.store import DocumentStore


def ingest_document(store: DocumentStore, title: str, chunks: list[dict], user_tags: list[str] | None = None) -> DocumentRecord:
    raise NotImplementedError
