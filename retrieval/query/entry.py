"""Chat-time entry point. See docs/v2-architecture.md for the flow.

parse_query -> route -> strategy (uses ranker) -> context -> LLM answer
"""

from retrieval.schemas import RetrievalResult
from retrieval.store import DocumentStore


def retrieve(
    store: DocumentStore, query: str, history: list[dict] | None = None
) -> RetrievalResult:
    raise NotImplementedError
