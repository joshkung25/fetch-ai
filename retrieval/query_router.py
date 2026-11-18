"""Query routing: ParsedQuery -> RoutePlan (which retrieval strategy to run).

Intended mapping:
    GENERAL          -> Strategy.NONE            (no personal docs needed)
    LOOKUP           -> Strategy.CHUNK_TOP_K     (precision: "what's my gpa")
    ENUMERATE        -> Strategy.ENUMERATE_DOCS  (coverage: "all my prescriptions")
    SINGLE_DOCUMENT  -> Strategy.WHOLE_DOCUMENT  ("summarize my lease")
"""

from retrieval.schemas import ParsedQuery, RoutePlan


def route(query: ParsedQuery) -> RoutePlan:
    raise NotImplementedError
