from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv(override=True)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def embed_text(text):
    response = client.embeddings.create(input=text, model="text-embedding-3-small")
    return response.data[0].embedding


def embed_text_batch(text_list):
    """
    Embed a batch of strings.
    Returns a list of embeddings, one for each input string.
    """
    if not text_list:
        return []

    response = client.embeddings.create(input=text_list, model="text-embedding-3-small")

    return [item.embedding for item in response.data]


# def delete_embeddings_by_source(source: str):
#     try:
#         collection = client.get_or_create_collection("documents")

#         # Get all IDs with the given source
#         results = collection.get(include=["metadatas", "ids"])
#         ids_to_delete = [id for id, meta in zip(results["ids"], results["metadatas"]) if meta.get("source") == source]

#         if ids_to_delete:
#             collection.delete(ids=ids_to_delete)
#             return True
#         else:
#             return False
#     except Exception as e:
#         print(f"Error deleting embeddings: {e}")
#         return False
