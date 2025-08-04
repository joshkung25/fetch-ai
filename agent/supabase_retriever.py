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
        if get_pdf_record_by_title(title, user_id):
            return True
        result = (
            supabase.table("pdfs")
            .insert(
                {
                    "title": title,
                    "auth0_id": user_id,
                    "file_path": file_path,
                    "created_at": datetime.utcnow().isoformat(),
                }
            )
            .execute()
        )
        return True
    except Exception as e:
        print("Exception inserting into pdfs table:", e)
        return False


def delete_pdf_from_storage(title: str, user_id: str) -> bool:
    """Deletes a file from Supabase Storage."""
    try:
        file_path = f"user_uploads/{user_id}/{title}"
        result = supabase.storage.from_("pdfs").remove([file_path])
        return True
    except Exception as e:
        print("Exception deleting file:", e)
        return False


def delete_pdf_record(title: str, user_id: str) -> bool:
    """Deletes a row from the pdfs table by title and user_id."""
    try:
        result = (
            supabase.table("pdfs")
            .delete()
            .eq("title", title)
            .eq("auth0_id", user_id)
            .execute()
        )
        return True
    except Exception as e:
        print("Exception deleting pdf record:", e)
        return False


def get_user_record(user_id: str) -> Optional[dict]:
    """Gets a record from the users table by id."""
    try:
        result = supabase.table("users").select("*").eq("auth0_id", user_id).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print("Exception getting user record:", e)
        return None


def insert_user_record(user_id: str, email: str, name: str) -> bool:
    """Inserts a record into the users table."""
    try:
        result = (
            supabase.table("users")
            .insert({"auth0_id": user_id, "email": email, "name": name})
            .execute()
        )
        return True
    except Exception as e:
        print("Exception inserting into users table:", e)
        return False


def delete_user_record(user_id: str) -> bool:
    """Deletes a row from the users table by id."""
    try:
        result = supabase.table("users").delete().eq("auth0_id", user_id).execute()
        return True
    except Exception as e:
        print("Exception deleting user record:", e)
        return False


def get_pdf_record_by_title(title: str, user_id: str) -> Optional[dict]:
    """Gets a record from the pdfs table by title and user_id."""
    try:
        result = (
            supabase.table("pdfs")
            .select("*")
            .eq("title", title)
            .eq("auth0_id", user_id)
            .execute()
        )
        return result.data[0] if result.data else None
    except Exception as e:
        print("Exception getting pdf record:", e)
        return None


def get_pdf_from_storage(title: str, user_id: str) -> Optional[bytes]:
    """Gets a file from Supabase Storage."""
    try:
        file_path = f"user_uploads/{user_id}/{title}"
        result = supabase.storage.from_("pdfs").download(file_path)
        return result
    except Exception as e:
        print("Exception getting file:", e)
        return None
