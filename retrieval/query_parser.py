"""Query-time parsing: turn the raw user question into a ParsedQuery
(intent for routing + target doc_types + rewritten search query + keywords)."""

from retrieval.schemas import ParsedQuery


def parse_query(query: str, history: list[dict] | None = None) -> ParsedQuery:
    """TODO: one LLM call (structured output -> ParsedQueryOutput), using the same taxonomy
    as the labeler so "all my recipes" maps to doc_type=recipe."""
    raise NotImplementedError
