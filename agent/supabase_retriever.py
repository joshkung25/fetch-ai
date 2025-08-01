import os
from typing import Optional
from datetime import datetime

from supabase import create_client, Client

# Load from env or hardcode here for dev
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://wumcssmnlofjkwzioqxd.supabase.co")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def upload_pdf_to_storage(
    file_bytes: bytes, filename: str, user_id: str
) -> Optional[str]:
    """Uploads a PDF file to Supabase Storage and returns its path or None on failure."""
    file_path = f"user_uploads/{user_id}/{filename}"
    try:
        result = supabase.storage.from_("pdfs").upload(
            file_path, file_bytes, {"content-type": "application/pdf"}
        )
        print("upload to bucket result", result)
        return file_path
    except Exception as e:
        print("Exception during upload:", e)
        return None


def insert_pdf_record(title: str, user_id: str, file_path: str) -> bool:
    """Inserts a record into the pdfs table."""
    try:
        result = (
            supabase.table("pdfs")
            .insert(
                {
                    "title": title,
                    "user_id": user_id,
                    "file_path": file_path,
                    "created_at": datetime.utcnow().isoformat(),
                }
            )
            .execute()
        )
        if result.get("error"):
            print("Insert error:", result["error"])
            return False
        return True
    except Exception as e:
        print("Exception inserting into pdfs table:", e)
        return False


def delete_pdf_from_storage(file_path: str) -> bool:
    """Deletes a file from Supabase Storage."""
    try:
        result = supabase.storage.from_("pdfs").remove([file_path])
        if result.get("error"):
            print("Delete error:", result["error"])
            return False
        return True
    except Exception as e:
        print("Exception deleting file:", e)
        return False


def delete_pdf_record(pdf_id: str) -> bool:
    """Deletes a row from the pdfs table by id."""
    try:
        result = supabase.table("pdfs").delete().eq("id", pdf_id).execute()
        if result.get("error"):
            print("Delete row error:", result["error"])
            return False
        return True
    except Exception as e:
        print("Exception deleting pdf record:", e)
        return False
