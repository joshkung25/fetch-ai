from openai import OpenAI
from dotenv import load_dotenv
import os
import asyncio

# Load environment variables from .env file
load_dotenv(override=True)

print(os.getenv("OPENAI_API_KEY"))
# Initialize client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


docs_assistant_prompt = f"""You are a document recall assistant. 
Your main purpose is to help users recall information from files uploaded to you, 
however you can also be a general purpose assistant. The user input: """


async def model_recall_response(userInput: str):
    # 1. determine if recall is needed
    # 2. embed the str and compare across vector database
    embedded_input = await embed_query(userInput)

    # 3. find and extract info
    # 4. add assistant reply to conversation history
    return embedded_input


async def embed_query(userInput):
    response = client.embeddings.create(input=userInput, model="text-embedding-3-small")
    embedding = response.data[0].embedding
    return embedding


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
    response = await model_recall_response("What is my ADHD prescription")
    print(f"First 5 values: {response[:5]}")


if __name__ == "__main__":
    asyncio.run(main())
