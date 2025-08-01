from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials
from agent.retriever import (
    add_doc_to_collection,
    get_all_user_docs_metadata,
    delete_doc_from_collection,
)
from parser.pdf_parser import parse_pdf
from agent.chat import chat
import tempfile
from pydantic import BaseModel
from typing import List, Dict
from auth.auth import get_current_user
import logging
from agent.supabase_retriever import upload_document_to_storage, insert_document_record

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
    guest_random_id: str | None = None


class DeleteRequest(BaseModel):
    title: str


@router.get("/")
def root():
    return {"message": "Hello from FastAPI!"}


@router.post("/add")
async def add_doc_route(
    file: UploadFile = File(...),
    title: str = Form(...),
    user_id: str = Depends(get_current_user),
    guest_random_id: str | None = Form(None),
    tags: List[str] | None = Form(None),
):
    try:
        # Save file to temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name
            doc_chunks = parse_pdf(tmp_path)

        # Add to collection
        if guest_random_id:
            add_doc_to_collection(
                doc_chunks, title, guest_random_id, tags, is_guest=True
            )
        else:
            add_doc_to_collection(doc_chunks, title, user_id, tags)
            upload_document_to_storage(file.file, title, user_id)
            insert_document_record(title, user_id, file.file)
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Error processing document: {str(e)}")
        if "413" in str(e):
            raise HTTPException(status_code=413, detail="413 File size too large")

        raise HTTPException(status_code=500, detail="500 Internal server error")
        # return {"status": "error", "message": str(e)}


@router.post("/chat")
async def chat_route(
    request: ChatRequest,
    user_id: str = Depends(get_current_user),
):
    logger.info(f"user_id: {user_id}")
    user_input = request.user_input
    messages = request.message_history
    if request.guest_random_id:
        return chat(user_input, messages, request.guest_random_id)
    else:
        return chat(user_input, messages, user_id)


@router.get("/list")
def list_docs(user_id: str = Depends(get_current_user)):
    try:
        metadata_list = get_all_user_docs_metadata(user_id)
        logger.info(f"metadata_list: {metadata_list[0]}")
        return {"documents": metadata_list}
    except Exception as e:
        logger.info(f"error: {e}")
        return {"status": "error", "message": str(e)}


@router.delete("/delete")
def delete_doc(
    title: str,
    user_id: str = Depends(get_current_user),
):
    logger.info(f"Deleting document: {title}")

    try:
        delete_doc_from_collection(title, user_id)
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "message": str(e)}
