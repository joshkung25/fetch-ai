import chromadb
from chromadb.config import Settings
from agent.embedder import embed_text

chroma_client = chromadb.Client(Settings())
collection = chroma_client.get_or_create_collection("mydocs")

def add_doc_to_collection(doc_chunks, title):
    embedded_chunks = []
    ids = [f"{title}_chunk_{i}" for i in range(len(doc_chunks))]

    for chunk in doc_chunks:
        embedded_chunks.append(embed_text(chunk))

    collection.add(documents=doc_chunks, ids=ids, embeddings=embedded_chunks)

def query_collection(embedded_input, n_results=1):
    return collection.query(
        query_embeddings=[embedded_input],
        n_results=n_results,
        include=["documents", "distances"],
    )
