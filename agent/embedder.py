from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv(override=True)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def embed_text(text):
    response = client.embeddings.create(
        input=text, model="text-embedding-3-small"
    )
    return response.data[0].embedding


def embed_text_batch(text_list):
    """
    Embed a batch of strings.
    Returns a list of embeddings, one for each input string.
    """
    if not text_list:
        return []

    response = client.embeddings.create(
        input=text_list, model="text-embedding-3-small"
    )

    return [item.embedding for item in response.data]
