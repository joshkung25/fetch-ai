import chromadb
from chromadb.config import Settings
from agent.embedder import embed_text_batch
from agent.embedder import embed_text

# Persistent vector DB store
chroma_client = chromadb.HttpClient(host="localhost", port=8000)
collection = chroma_client.get_or_create_collection("mydocs")

print(collection.count())


def add_doc_to_collection(doc_chunks, title):
    ids = [f"{title}_chunk_{i}" for i in range(len(doc_chunks))]
    texts = [chunk["text"] for chunk in doc_chunks]

    metadatas = [
        {
            "page": chunk.get("page"),
            "chunk_index": chunk.get("chunk_index"),
            "source_file": chunk.get("source_file"),
        }
        for chunk in doc_chunks
    ]

    embeddings = embed_text_batch(texts)

    collection.add(documents=texts, ids=ids, embeddings=embeddings, metadatas=metadatas)
    print(collection.count())


# def add_doc_to_collection(doc_chunks, title):
#     embedded_chunks = []
#     ids = [f"{title}_chunk_{i}" for i in range(len(doc_chunks))]

#     for chunk in doc_chunks:
#         embedded_chunks.append(embed_text(chunk))
#         print(doc_chunks)
#     collection.add(documents=doc_chunks, ids=ids, embeddings=embedded_chunks)


def query_collection(embedded_input, n_results=1):
    """
    Query the collection with a vector and return top-k matching chunks.
    """
    return collection.query(
        query_embeddings=[embedded_input],
        n_results=n_results,
        include=["documents", "distances", "metadatas"],
    )


def get_collection():
    return chroma_client.get_or_create_collection("mydocs")


def remove_collection():
    chroma_client.delete_collection("mydocs")
    print(collection.count())
