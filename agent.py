from openai import OpenAI
import chromadb
from chromadb.config import Settings
from dotenv import load_dotenv
import os
import asyncio

# --- SETUP ---

# Load environment variables from .env file
load_dotenv(override=True)

# Initialize chroma
chroma_client = chromadb.Client(Settings())
collection = chroma_client.get_or_create_collection("mydocs")

# Initialize client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
docs_assistant_prompt = f"""You are a document recall assistant. 
Your main purpose is to help users recall information from files uploaded to you, 
however you can also be a general purpose assistant. The user input: """


async def model_recall_response(userInput: str):
    # 1. determine if recall is needed
    # 2. embed the str and compare across vector database
    embedded_input = await embed_text(userInput)

    # 3. find and extract info
    # 4. add assistant reply to conversation history
    return embedded_input


async def embed_text(userInput):
    response = client.embeddings.create(input=userInput, model="text-embedding-3-small")
    embedding = response.data[0].embedding
    return embedding


# Change later to input document, parse, and add to collection
async def add_doc_to_collection(doc_text):
    # Embed the text
    embedding = await embed_text(doc_text)
    # Add to collection
    collection.add(documents=[doc_text], ids=[doc_text], embeddings=[embedding])


# Set up conversation history
messages = []

print("Chat with your assistant (type 'exit' to quit):")

while True:
    user_input = input("You: ")

    if user_input.lower() in ["exit", "quit"]:
        break

    # Add user message to history
    messages.append({"role": "user", "content": docs_assistant_prompt + user_input})

    # Send to OpenAI
    response = client.chat.completions.create(
        model="gpt-4o-mini",  # or gpt-4o
        messages=messages,
    )

    # Get assistant reply
    assistant_reply = response.choices[0].message.content
    print(f"Assistant: {assistant_reply}")

    # Add assistant reply to history
    messages.append({"role": "assistant", "content": assistant_reply})


async def main():
    doc_text = "The patient was prescribed Adderall 20mg daily for ADHD."
    doc_embedding = await embed_text(doc_text)
    doc_embedding2 = await embed_text(
        "The patient was diagnosed with anxiety and was prescribed Xanax 1mg daily"
    )
    # Add documents to collection
    collection.add(
        documents=[doc_text],
        ids=["doc1"],
        embeddings=[doc_embedding],
    )
    collection.add(
        documents=[
            "The patient was diagnosed with anxiety and was prescribed Xanax 1mg daily"
        ],
        ids=["doc2"],
        embeddings=[doc_embedding2],
    )

    query_embedding = await embed_text("anxiety medication")
    results = collection.query(query_embeddings=[query_embedding], n_results=1)

    print(results["documents"][0][0])
    print(results["distances"][0][0])


if __name__ == "__main__":
    asyncio.run(main())
