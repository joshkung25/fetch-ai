from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Response, Body
from fastapi.security import HTTPAuthorizationCredentials
from agent.retriever import (
    add_doc_to_collection,
    get_all_user_docs_metadata,
    delete_doc_from_collection,
    delete_collection,
    get_collection,
)
from agent.chat import chat, suggested_tags
from agent.supabase_retriever import (
    upload_pdf_to_storage,
    insert_pdf_record,
    insert_user_record,
    get_user_record,
    delete_pdf_from_storage,
    delete_pdf_record,
    get_pdf_from_storage,
    get_chat_record_by_id,
    get_chat_list_by_user_id,
    get_pdf_record_by_title,
    supabase,
)
from parser.pdf_parser import parse_pdf
import tempfile
from pydantic import BaseModel
from typing import List, Dict
from auth.auth import get_current_user
import logging
import json
import datetime

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
    chat_id: str
    guest_random_id: str | None = None
    include_source: bool | None = (Form(default=False),)


class DeleteRequest(BaseModel):
    title: str


class AddUserRequest(BaseModel):  # TODO: make more secure, any user can add any user
    user_id: str
    email: str
    name: str

class UpdateTagsRequest(BaseModel):
    title: str
    tags: list[str]

class ReplaceDocRequest(BaseModel):
    title: str
    tags: list[str] | None = None

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
    """
    Adds a document to the database
    """
    user_id = user_id.replace("|", "")
    try:
        file_bytes = await file.read()
        # Save file to temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name
            doc_chunks = parse_pdf(tmp_path)

        # Add to collection
        if guest_random_id:
            add_doc_to_collection(
                doc_chunks, title, guest_random_id, tags, is_guest=True
            )
        else:
            add_doc_to_collection(doc_chunks, title, user_id, tags)
            # Upload to Supabase storage
            file_path = upload_pdf_to_storage(file_bytes, title, user_id)
            if file_path:
                insert_pdf_record(title, user_id, file_path, tags)
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
    """
    Chat with the assistant
    """
    user_id = user_id.replace("|", "")

    user_input = request.user_input
    messages = request.message_history
    chat_id = request.chat_id
    if request.guest_random_id:
        return chat(
            user_input,
            messages,
            request.guest_random_id,
            chat_id,
            is_guest=True,
            include_source=request.include_source,
        )
    else:
        return chat(
            user_input,
            messages,
            user_id,
            chat_id,
            is_guest=False,
            include_source=request.include_source,
        )


@router.get("/list")
def list_docs(user_id: str = Depends(get_current_user)):
    """
    Lists all documents for a user
    """
    user_id = user_id.replace("|", "")
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
    """
    Deletes a document from the database
    """
    logger.info(f"Deleting document: {title}")
    user_id = user_id.replace("|", "")
    try:
        delete_doc_from_collection(title, user_id)
        delete_pdf_from_storage(title, user_id)
        delete_pdf_record(title, user_id)

        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/add-user")
def add_user(request: AddUserRequest):
    """
    Adds a user to the database if they don't exist
    """
    user_id = request.user_id.replace("|", "")
    if not get_user_record(user_id):
        insert_user_record(user_id, request.email, request.name)
    return {"status": "ok"}


@router.get("/preview")
def preview_doc(title: str, user_id: str = Depends(get_current_user)):
    """
    Previews a document
    """
    user_id = user_id.replace("|", "")
    pdf_bytes = get_pdf_from_storage(title, user_id)

    if pdf_bytes is None:
        raise HTTPException(status_code=404, detail="PDF not found")

    return Response(content=pdf_bytes, media_type="application/pdf")


@router.delete("/delete-collection")
def delete_chroma_collection(user_id: str = Depends(get_current_user)):
    """
    Deletes a collection from the database
    """
    user_id = user_id.replace("|", "")
    delete_collection(user_id)
    return {"status": "ok"}


@router.get("/suggested_tags")
def suggested_tags_route(document_title: str):
    return {"tags": suggested_tags(document_title)}


@router.get("/chat/{chat_id}")
def get_chat(chat_id: str, user_id: str = Depends(get_current_user)):
    user_id = user_id.replace("|", "")
    return get_chat_record_by_id(chat_id, user_id)


@router.get("/chat-list")
def get_chat_list(user_id: str = Depends(get_current_user)):
    user_id = user_id.replace("|", "")
    return get_chat_list_by_user_id(user_id)

@router.post("/update-tags")
def update_tags(
    request: UpdateTagsRequest,
    user_id: str = Depends(get_current_user),
):
    """
    Updates tags for a document in both Supabase and ChromaDB
    """
    user_id = user_id.replace("|", "")
    try:
        supabase.table("pdfs") \
            .update({"tags": request.tags}) \
            .eq("title", request.title) \
            .eq("auth0_id", user_id) \
            .execute()

        collection = get_collection(user_id)
        docs = collection.get(include=["ids", "metadatas"])
        ids_to_update = []
        metadatas_to_update = []
        for doc_id, meta in zip(docs["ids"], docs["metadatas"]):
            if meta.get("title") == request.title:
                ids_to_update.append(doc_id)
                new_meta = dict(meta)
                new_meta["tags"] = ",".join(request.tags)
                metadatas_to_update.append(new_meta)
        if ids_to_update:
            collection.update(
                ids=ids_to_update,
                metadatas=metadatas_to_update
            )

        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/replace")
async def replace_doc_route(
    file: UploadFile = File(...),
    request: str = Form(...),
    user_id: str = Depends(get_current_user),
):
    user_id = user_id.replace("|", "")
    try:
        req_data = json.loads(request)
        title = req_data["title"]
        tags = req_data.get("tags", [])

        file_bytes = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name
            doc_chunks = parse_pdf(tmp_path)

        # Remove old doc from ChromaDB and Supabase
        delete_doc_from_collection(title, user_id)
        delete_pdf_from_storage(title, user_id)
        delete_pdf_record(title, user_id)

        # Add new doc
        add_doc_to_collection(doc_chunks, title, user_id, tags)
        file_path = upload_pdf_to_storage(file_bytes, title, user_id)
        if file_path:
            now = datetime.datetime.utcnow().isoformat()
            result = insert_pdf_record(title, user_id, file_path, tags, created_at=now)
            if not result:
                raise HTTPException(status_code=500, detail="Supabase insert failed")
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Error replacing document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
