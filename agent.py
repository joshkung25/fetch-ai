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

DOCS_ASSISTANT_PROMPT = """You are a document recall assistant.
Your main purpose is to help users recall information from files uploaded to you, 
however you can also be a general purpose assistant. """


def model_recall_response(
    user_input: str,
):
    """Fetches relevant information from the vector database, and then uses that information in the prompt for the model.
    Returns the prompt for the model to use."""

    # embed the input
    embedded_input = embed_text(user_input)

    # find and extract info
    # can change so it checks for multiple results, and then includes all of the relevant ones in the response
    results = collection.query(
        query_embeddings=[embedded_input],
        n_results=1,
        include=["documents", "distances"],
    )
    # print(results)
    # check if relevant information found
    if results["distances"][0][0] > 0.8:
        RAG_ASSISTANT_PROMPT = (
            "There was relevant information found, use this information in your response: "
            + results["documents"][0][0]
            + "This was the user's input: "
            + user_input
        )
    else:
        RAG_ASSISTANT_PROMPT = (
            "There was no relevant information found, tell them to make sure they upload relevant documents. Then use your general knowledge to respond. "
            + "This was the user's input: "
            + user_input
        )

    # assistant response
    # model_response = client.chat.completions.create(
    #     model="gpt-4o-mini",
    #     messages=[
    #         {
    #             "role": "user",
    #             "content": DOCS_ASSISTANT_PROMPT + RAG_ASSISTANT_PROMPT,
    #         },
    #     ],
    # )

    # return model_response.choices[0].message.content
    return DOCS_ASSISTANT_PROMPT + RAG_ASSISTANT_PROMPT


# Change later to input document, parse, and add to collection
def add_doc_to_collection(doc_text):
    """Add a document to the vector collection."""
    # Embed the text
    embedding = embed_text(doc_text)
    # Add to collection
    collection.add(documents=[doc_text], ids=[doc_text], embeddings=[embedding])


def embed_text(user_input):
    """Helper function to embed a text string."""
    response = client.embeddings.create(
        input=user_input, model="text-embedding-3-small"
    )
    embedding = response.data[0].embedding
    return embedding


add_doc_to_collection("The patient was prescribed Adderall 20mg daily for ADHD.")
add_doc_to_collection(
    "The patient was diagnosed with anxiety and was prescribed Xanax 1mg daily"
)
# Set up conversation history
messages = []

print("Chat with your assistant (type 'exit' to quit):")

while True:
    user_input = input("You: ")

    if user_input.lower() in ["exit", "quit"]:
        break

    # print(model_recall_response(user_input))

    # Add user message to history
    messages.append({"role": "user", "content": model_recall_response(user_input)})

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


# async def main():
#     await add_doc_to_collection(
#         "The patient was prescribed Adderall 20mg daily for ADHD."
#     )
#     await add_doc_to_collection(
#         "The patient was diagnosed with anxiety and was prescribed Xanax 1mg daily"
#     )


# if __name__ == "__main__":
#     asyncio.run(main())
