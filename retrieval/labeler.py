"""Ingest-time document labeling: assign each uploaded document a DocType (see taxonomy.py),
plus a summary/keywords so documents (not just chunks) are searchable.

This is what makes coverage queries ("all my recipes") possible: filter docs by label,
instead of hoping the top-3 chunks happen to hit every recipe.
"""

from retrieval.schemas import DocumentRecord


def label_document(doc_id: str, title: str, chunks: list[dict], user_tags: list[str] | None = None) -> DocumentRecord:
    """chunks = output of parser.pdf_parser.parse_pdf.

    TODO: one LLM call (structured output -> DocumentLabelOutput) on title + first few pages.
    """
    raise NotImplementedError
