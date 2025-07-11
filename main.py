from agent.chat import start_chat
from parser.pdf_parser import parse_pdf_token_chunks
from agent.retriever import add_doc_to_collection

if __name__ == "__main__":
    resume_chunks = parse_pdf_token_chunks("public/resume.pdf", doc_type="resume")
    transcript_chunks = parse_pdf_token_chunks("public/transcript.pdf", doc_type="transcript")

    add_doc_to_collection(resume_chunks, "resume")
    add_doc_to_collection(transcript_chunks, "transcript")

    start_chat()
