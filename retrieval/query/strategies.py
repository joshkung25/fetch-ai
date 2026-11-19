"""One retrieval strategy per route. Each returns ContextBlocks for the answering LLM."""

from retrieval.rankers import Ranker
from retrieval.schemas import ContextBlock, ParsedQuery
from retrieval.store import DocumentStore


def chunk_top_k(store: DocumentStore, query: ParsedQuery) -> list[ContextBlock]:
    """LOOKUP (precision): top-k chunks, like v1. Later: hybrid ranking over chunks."""
    raise NotImplementedError


def enumerate_docs(store: DocumentStore, query: ParsedQuery, ranker: Ranker) -> list[ContextBlock]:
    """ENUMERATE (coverage): docs whose label matches, UNION docs the ranker scores above a
    cutoff. Uses a threshold, not top-k, so *all* matches come back."""
    raise NotImplementedError


def whole_document(store: DocumentStore, query: ParsedQuery, ranker: Ranker) -> list[ContextBlock]:
    """SINGLE_DOCUMENT: figure out which doc the user means, return its full text."""
    raise NotImplementedError
