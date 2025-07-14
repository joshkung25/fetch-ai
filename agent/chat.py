from dotenv import load_dotenv
from openai import OpenAI
import os

from parser.pdf_parser import parse_pdf
from agent.retriever import add_doc_to_collection
from agent.agent import model_recall_response

# Load environment variables
load_dotenv(override=True)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def start_chat():
    """Start the chat interface with the AI assistant."""
    messages = []

    # Add documents to collection (only the medical examples, since resume/transcript are loaded in main.py)
    add_doc_to_collection(
        ["The patient was prescribed Adderall 20mg daily for ADHD."], "adhd"
    )
    add_doc_to_collection(
        ["The patient was diagnosed with anxiety and was prescribed Xanax 1mg daily."],
        "anxiety",
    )

    # Chat loop
    print("Chat with your assistant (type 'exit' to quit):")

    while True:
        user_input = input("You: ")

        if user_input.lower() in ["exit", "quit"]:
            break

        messages.append({"role": "user", "content": model_recall_response(user_input)})

        response = client.chat.completions.create(
            model="gpt-4o-mini",  # or gpt-4o
            messages=messages,
        )

        assistant_reply = response.choices[0].message.content
        print(f"Assistant: {assistant_reply}")

        messages.append({"role": "assistant", "content": assistant_reply})


if __name__ == "__main__":
    start_chat()
