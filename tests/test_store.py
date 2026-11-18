"""DocumentStore tests: in-memory Chroma + a fake embedder (no server, no API key)."""

import uuid

import chromadb
import pytest

from retrieval.schemas import DocumentRecord
from retrieval.store import DocumentStore
from retrieval.taxonomy import Category, DocType, category_of

VOCAB = ["pasta", "tomato", "garlic", "gpa", "grades", "course", "rent", "landlord", "dose", "mg"]


def fake_embed(texts: list[str]) -> list[list[float]]:
    """Bag-of-words over a tiny vocab; +1 dim so no vector is all zeros."""
    return [[float(t.lower().count(w)) for w in VOCAB] + [0.1] for t in texts]


def make_record(title: str, doc_type: DocType, keywords: list[str]) -> DocumentRecord:
    return DocumentRecord(
        doc_id=uuid.uuid4().hex,
        title=title,
        doc_type=doc_type,
        category=category_of(doc_type),
        summary=f"summary of {title}",
        keywords=keywords,
        entities=["Some Org, Inc."],  # comma inside a value must survive the round trip
        document_date=None,
        contains_multiple_items=False,
        user_tags=["mine"],
    )


def chunks(*texts: str) -> list[dict]:
    return [{"text": t, "page": 1, "chunk_index": i} for i, t in enumerate(texts)]


@pytest.fixture
def store() -> DocumentStore:
    # unique user per test: EphemeralClient instances share state within a process
    return DocumentStore(chromadb.EphemeralClient(), f"test-user-{uuid.uuid4().hex}", embed_fn=fake_embed)


@pytest.fixture
def seeded(store):
    docs = {
        "pasta": make_record("Pasta", DocType.RECIPE, ["pasta", "dinner"]),
        "soup": make_record("Tomato Soup", DocType.RECIPE, ["soup"]),
        "transcript": make_record("Transcript", DocType.TRANSCRIPT, ["gpa", "grades"]),
        "lease": make_record("Lease", DocType.LEASE, ["rent"]),
    }
    store.add_document(docs["pasta"], chunks("boil pasta", "add garlic and tomato"))
    store.add_document(docs["soup"], chunks("tomato tomato soup"))
    store.add_document(docs["transcript"], chunks("gpa 3.8", "course grades fall"))
    store.add_document(docs["lease"], chunks("rent due monthly to landlord"))
    return store, docs


def test_round_trip_preserves_record(seeded):
    store, docs = seeded
    [got] = store.get_documents(ids=[docs["pasta"].doc_id])
    assert got.title == "Pasta"
    assert got.doc_type is DocType.RECIPE and got.category is Category.PERSONAL
    assert got.keywords == ["pasta", "dinner"]
    assert got.entities == ["Some Org  Inc."]
    assert got.user_tags == ["mine"]
    assert got.embedding is not None


def test_filter_by_doc_type_and_category(seeded):
    store, _ = seeded
    assert {d.title for d in store.get_documents(doc_types=[DocType.RECIPE])} == {"Pasta", "Tomato Soup"}
    assert {d.title for d in store.get_documents(categories=[Category.EDUCATION])} == {"Transcript"}
    both = store.get_documents(doc_types=[DocType.LEASE], categories=[Category.EDUCATION])
    assert {d.title for d in both} == {"Lease", "Transcript"}
    assert len(store.get_documents()) == 4


def test_chunks_come_back_in_order(seeded):
    store, docs = seeded
    texts = [c["text"] for c in store.get_document_chunks(docs["pasta"].doc_id)]
    assert texts == ["boil pasta", "add garlic and tomato"]


def test_search_chunks_ranks_and_restricts(seeded):
    store, docs = seeded
    q = fake_embed(["gpa grades"])[0]
    hits = store.search_chunks(q, n_results=2)
    assert hits[0]["doc_id"] == docs["transcript"].doc_id
    assert hits[0]["similarity"] > hits[-1]["similarity"] or len(hits) == 1

    only_recipes = store.search_chunks(q, n_results=10, doc_ids=[docs["pasta"].doc_id, docs["soup"].doc_id])
    assert {h["doc_id"] for h in only_recipes} <= {docs["pasta"].doc_id, docs["soup"].doc_id}


def test_delete_removes_doc_and_its_chunks_only(seeded):
    store, docs = seeded
    store.delete_document(docs["pasta"].doc_id)
    assert store.count() == 3
    assert store.get_document_chunks(docs["pasta"].doc_id) == []
    assert store.get_document_chunks(docs["soup"].doc_id)  # other docs untouched


def test_get_by_title(seeded):
    store, docs = seeded
    assert store.get_document_by_title("Lease").doc_id == docs["lease"].doc_id
    assert store.get_document_by_title("nope") is None
