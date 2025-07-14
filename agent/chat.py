from dotenv import load_dotenv
from openai import OpenAI
import os

from parser.pdf_parser import parse_pdf
from agent.retriever import add_doc_to_collection
from agent.agent import model_recall_response

# Load environment variables
load_dotenv(override=True)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
messages = []

# Add documents to collection
add_doc_to_collection(
    ["The patient was prescribed Adderall 20mg daily for ADHD."], "adhd"
)
add_doc_to_collection(
    ["The patient was diagnosed with anxiety and was prescribed Xanax 1mg daily."],
    "anxiety",
)
add_doc_to_collection(parse_pdf("public/Josh_Kung_Resume_2025_v4.pdf"), "resume")
add_doc_to_collection(
    parse_pdf("public/JoshuaKung_AcademicTranscript_Northeastern_2026.pdf"),
    "academic_transcript",
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
