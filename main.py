from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.routes import router

from agent.chat import start_chat

# from parser.pdf_parser import parse_pdf_token_chunks
from parser.pdf_parser import parse_pdf
from agent.retriever import add_doc_to_collection, remove_collection

app = FastAPI()

origins = [
    "http://localhost:3000",
    "https://fetch-ai-mu.vercel.app",
    "https://fetchfileai.com",
    "https://www.fetchfileai.com",
    "https://api.fetchfileai.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


if __name__ == "__main__":
    # resume_chunks = parse_pdf_token_chunks("public/resume.pdf", doc_type="resume")
    # transcript_chunks = parse_pdf_token_chunks(
    #     "public/transcript.pdf", doc_type="transcript"
    # )

    # add_doc_to_collection(resume_chunks, "resume")
    # add_doc_to_collection(transcript_chunks, "transcript")

    # ================================
    # resume_chunks = parse_pdf("public/Josh_Kung_Resume_2025_v4.pdf")
    # add_doc_to_collection(resume_chunks, "resume")

    # transcript_chunks = parse_pdf(
    #     "public/JoshuaKung_AcademicTranscript_Northeastern_2026.pdf"
    # )
    # add_doc_to_collection(transcript_chunks, "transcript")

    # transcript_chunks_jacob = parse_pdf("public/Jacob_Transcript_Test.pdf")
    # add_doc_to_collection(transcript_chunks_jacob, "jacob_transcript")
    # remove_collection()
    start_chat()
