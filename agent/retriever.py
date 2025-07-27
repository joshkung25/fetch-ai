import chromadb
from chromadb.config import Settings
from agent.embedder import embed_text_batch
from agent.embedder import embed_text
import os

# Persistent vector DB store - use environment variables for Docker compatibility
chroma_host = os.getenv("CHROMA_SERVER_HOST", "localhost")
chroma_port = int(os.getenv("CHROMA_SERVER_PORT", "8000"))
chroma_client = chromadb.HttpClient(host=chroma_host, port=chroma_port)

# Session-based guest client (persists for the application session)
guest_client = chromadb.Client()


def add_doc_to_collection(doc_chunks, title, user_id):
    user_id = user_id.replace("|", "")
    collection = get_collection(user_id)
    ids = [f"{title}_chunk_{i}" for i in range(len(doc_chunks))]
    texts = [chunk["text"] for chunk in doc_chunks]

    metadatas = [
        {
            "page": chunk.get("page"),
            "chunk_index": chunk.get("chunk_index"),
            "source_file": chunk.get("source_file"),
            "title": title,
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


def query_collection(embedded_input, user_id, n_results=1):
    """
    Query the collection with a vector and return top-k matching chunks.
    """
    return get_collection(user_id).query(
        query_embeddings=[embedded_input],
        n_results=n_results,
        include=["documents", "distances", "metadatas"],
    )


def get_collection(user_id):
    """
    Returns the collection for the user.
    If the user is a guest, uses the session-based in-memory client.
    """
    if user_id == "guest":
        return guest_client.get_or_create_collection(f"{user_id}_docs")
    else:
        return chroma_client.get_or_create_collection(f"{user_id}_docs")


def remove_collection(user_id):
    chroma_client.delete_collection(f"{user_id}_docs")
    # print(get_collection(user_id).count())

