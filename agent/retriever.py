import chromadb
from chromadb.config import Settings
from agent.embedder import embed_text_batch
from agent.embedder import embed_text
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

logger = logging.getLogger(__name__)

# Persistent vector DB store - use environment variables for Docker compatibility
chroma_host = os.getenv("CHROMA_SERVER_HOST", "localhost")
chroma_port = int(os.getenv("CHROMA_SERVER_PORT", "8000"))
chroma_client = chromadb.HttpClient(host=chroma_host, port=chroma_port)

# Session-based guest client (persists for the application session)
guest_client = chromadb.Client()


def add_doc_to_collection(doc_chunks, title, user_id, tags=None, is_guest=False):
    user_id = user_id.replace("|", "")
    collection = get_collection(user_id, is_guest)
    ids = [f"{title}_chunk_{i}" for i in range(len(doc_chunks))]
    texts = [chunk["text"] for chunk in doc_chunks]
    if tags:
        metadatas = [
            {
                "page": chunk.get("page"),
                "chunk_index": chunk.get("chunk_index"),
                "source_file": chunk.get("source_file"),
                "title": title,
                "tags": ",".join(tags),
            }
            for chunk in doc_chunks
        ]
    else:
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
    logger.info(f"Client collection count: {get_client_collection_count(is_guest)}")


def query_collection(embedded_input, user_id, n_results=1):
    """
    Query the collection with a vector and return top-k matching chunks.
    """
    return get_collection(user_id).query(
        query_embeddings=[embedded_input],
        n_results=n_results,
        include=["documents", "distances", "metadatas"],
    )


def get_collection(user_id, is_guest=False):  # TODO: DOUBLE CHECK THIS FOR GUEST MODE
    """
    Returns the collection for the user.
    If the user is a guest, uses the session-based in-memory client.
    """
    if is_guest:
        return guest_client.get_or_create_collection(f"{user_id}_docs")
    else:
        user_id = user_id.replace("|", "")
        return chroma_client.get_or_create_collection(f"{user_id}_docs")


def remove_collection(user_id):
    chroma_client.delete_collection(f"{user_id}_docs")
    # print(get_collection(user_id).count())


def get_all_user_docs_metadata(user_id):
    seen_titles = []  # set to avoid duplicates
    return_list = []  # list to return
    result = get_collection(user_id).get(include=["metadatas"])
    for meta in result["metadatas"]:
        title = meta.get("title")
        if title is None:
            continue
        if title not in seen_titles:
            seen_titles.append(title)
            return_list.append(meta)
    return return_list


def delete_doc_from_collection(title, user_id):  # TODO: HANDLE GUEST MODE
    """
    Delete a document from the collection.
    """
    collection = get_collection(user_id)
    logger.info(f"collection count: {collection.count()}")
    # must have stored title as metadata during upload
    docs = collection.get(include=["metadatas"])

    ids_to_delete = []
    for doc_id, meta in zip(docs["ids"], docs["metadatas"]):
        meta_title = meta.get("title")
        if meta_title is None:
            continue
        if meta_title == title:
            ids_to_delete.append(doc_id)

    # ids_to_delete = [
    #     doc_id
    #     for doc_id, meta in zip(docs["ids"], docs["metadatas"])
    #     if meta.get("title") == title
    # ]
    logger.info(f"ids_to_delete: {ids_to_delete}")
    if ids_to_delete:
        collection.delete(ids=ids_to_delete)
        logger.info(f"new collection count: {collection.count()}")
    else:
        logger.info("No documents found to delete")


def get_client_collection_count(is_guest=False):
    if is_guest:
        return guest_client.count_collections()
    else:
        return chroma_client.count_collections()


def delete_collection(user_id):
    chroma_client.delete_collection(f"{user_id}_docs")
