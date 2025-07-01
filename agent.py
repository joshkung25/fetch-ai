from openai import OpenAI
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Initialize client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

docs_assistant_prompt = f"""You are a document recall assistant. 
Your main purpose is to help users recall information from files uploaded to you, 
however you can also be a general purpose assistant. The user input: """


async def model_recall_response(prompt: str):
    # determine if recall is needed
    # embed the str and compare across vector database
    # find and extract info
    # add assistant reply to conversation history
    return


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
