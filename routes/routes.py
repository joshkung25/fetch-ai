from fastapi import APIRouter, UploadFile, File, Form, Depends
from fastapi.security import HTTPAuthorizationCredentials
from agent.retriever import add_doc_to_collection
from parser.pdf_parser import parse_pdf
from agent.chat import chat
import tempfile
from pydantic import BaseModel
from typing import List, Dict
from auth.auth import get_current_user
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()
# @router.get("/search")
# def search(query: str):
#     return model_recall_response(query)


class ChatRequest(BaseModel):
    user_input: str
    message_history: List[Dict]


@router.get("/")
def root():
    return {"message": "Hello from FastAPI!"}


@router.post("/add")
async def add_doc_route(
    file: UploadFile = File(...),
    title: str = Form(...),
    user_id: str = Depends(get_current_user),
):
    try:
        # Save file to temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name
            doc_chunks = parse_pdf(tmp_path)

        # Add to collection
        add_doc_to_collection(doc_chunks, title, user_id)
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/chat")
async def chat_route(
    request: ChatRequest,
    user_id: str = Depends(get_current_user),
):
    logger.info(f"user_id: {user_id}")
    user_input = request.user_input
    messages = request.message_history
    return chat(user_input, messages, user_id)
