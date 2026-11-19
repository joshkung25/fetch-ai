"""Ingest-time document labeling: assign each uploaded document a DocType (see taxonomy.py),
plus a summary/keywords so documents (not just chunks) are searchable.

This is what makes coverage queries ("all my recipes") possible: filter docs by label,
instead of hoping the top-3 chunks happen to hit every recipe.
"""

import os

from dotenv import load_dotenv
from openai import OpenAI

from retrieval import config
from retrieval.schemas import DocumentLabelOutput, DocumentRecord
from retrieval.taxonomy import category_of, taxonomy_prompt_block

load_dotenv(override=True)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

LABELER_PROMPT = f"""You label personal documents that a user uploaded to their private document vault.
Pick exactly one doc_type from this taxonomy (use "other" only if nothing fits):

{taxonomy_prompt_block()}

Be factual and only use information present in the document.
Keywords should include words a user would naturally search with, even if they don't appear
verbatim (e.g. for a transcript: gpa, grades, courses, credits)."""

SAMPLE_CHARS = 6000  # how much of the document the labeler reads, from the start


def label_document(doc_id: str, title: str, chunks: list[dict], user_tags: list[str] | None = None) -> DocumentRecord:
    """chunks = output of parser.pdf_parser.parse_pdf. One LLM call on title + start of the doc."""
    sample = "".join(c["text"] for c in chunks)[:SAMPLE_CHARS]

    user_message = f"Title: {title}\n"
    if user_tags:
        user_message += f"User tags: {', '.join(user_tags)}\n"
    user_message += f"\nDocument text (beginning):\n{sample}"

    response = client.chat.completions.parse(
        model=config.LABELER_MODEL,
        messages=[
            {"role": "system", "content": LABELER_PROMPT},
            {"role": "user", "content": user_message},
        ],
        response_format=DocumentLabelOutput,
        temperature=0,
    )
    label = response.choices[0].message.parsed
    if label is None:
        raise RuntimeError(f"labeling failed for {title!r}: {response.choices[0].message.refusal}")

    return DocumentRecord(
        doc_id=doc_id,
        title=title,
        doc_type=label.doc_type,
        category=category_of(label.doc_type),  # derived, never from the LLM
        summary=label.summary,
        keywords=[k.lower().strip() for k in label.keywords if k.strip()],
        entities=label.entities,
        document_date=label.document_date,
        contains_multiple_items=label.contains_multiple_items,
        user_tags=[t.lower().strip() for t in (user_tags or []) if t.strip()],
        page_count=len({c["page"] for c in chunks if c.get("page") is not None}) or None,
    )
