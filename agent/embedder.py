from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def embed_text(user_input):
    response = client.embeddings.create(
        input=user_input, model="text-embedding-3-small"
    )
    embedding = response.data[0].embedding
    return embedding
