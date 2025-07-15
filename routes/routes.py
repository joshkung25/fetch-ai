from fastapi import APIRouter, UploadFile, File, Form
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
def add_doc_route(file: UploadFile = File(...), title: str = Form(...)):
    try:
        file_path = f"public/{file.filename}"  # Change later to not use public folder
        doc_chunks = parse_pdf(file_path)
        add_doc_to_collection(doc_chunks, title)
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/chat")
def chat_route(query: str, messages: list[dict]):
    return chat(query, messages)
