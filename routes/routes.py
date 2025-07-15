from fastapi import APIRouter
from agent.retriever import add_doc_to_collection
from parser.pdf_parser import parse_pdf
from agent.chat import chat

router = APIRouter()
# @router.get("/search")
# def search(query: str):
#     return model_recall_response(query)


@router.get("/")
def root():
    return {"message": "Hello from FastAPI!"}


@router.post("/add")
def add_doc_route(doc: str, title: str):
    try:
        doc_chunks = parse_pdf(doc)
        add_doc_to_collection(doc_chunks, title)
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/chat")
def chat_route(query: str, messages: list[dict]):
    return chat(query, messages)
