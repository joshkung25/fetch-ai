from dotenv import load_dotenv
from openai import OpenAI
import os

from parser.pdf_parser import parse_pdf
from agent.retriever import add_doc_to_collection
from agent.agent import model_recall_response

# Load environment variables
load_dotenv(override=True)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

DOCS_ASSISTANT_PROMPT = """You are a document recall assistant.
Your main purpose is to help users recall information from files uploaded to you, 
however you can also be a general purpose assistant. """


def start_chat():
    """Start the chat interface with the AI assistant."""
    messages = []
    # add_doc_to_collection(
    #     ["The patient was prescribed Adderall 20mg daily for ADHD."], "adhd"
    # )
    # add_doc_to_collection(
    #     ["The patient was diagnosed with anxiety and was prescribed Xanax 1mg daily."],
    #     "anxiety",
    # )

    # Chat loop
    print("Chat with your assistant (type 'exit' to quit):")

    while True:
        user_input = input("You: ")

        if user_input.lower() in ["exit", "quit"]:
            break

        messages.append(
            {
                "role": "user",
                "content": model_recall_response(
                    user_input, "google-oauth2112897530008069583936"
                ),
            }
        )

        response = client.chat.completions.create(
            model="gpt-4o-mini",  # or gpt-4o
            messages=messages,
        )

        assistant_reply = response.choices[0].message.content
        print(f"Assistant: {assistant_reply}")

        messages.append({"role": "assistant", "content": assistant_reply})


def chat(user_input, messages, user_id):
    """
    Takes in a user input and a list of messages, and returns a response from the AI assistant.
    """
    user_id = user_id.replace("|", "")
    input_to_model = model_recall_response(user_input, user_id)
    if len(messages) == 0:
        input_to_model = DOCS_ASSISTANT_PROMPT + input_to_model

    messages.append({"role": "user", "content": input_to_model})

    # model response
    response = client.chat.completions.create(
        model="gpt-4o-mini",  # or gpt-4o
        messages=messages,
    )
    assistant_reply = response.choices[0].message.content

    messages.append({"role": "assistant", "content": assistant_reply})
    return assistant_reply, messages


if __name__ == "__main__":
    start_chat()
