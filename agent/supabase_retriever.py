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


def insert_pdf_record(  # TODO: possibly create pdf class?
    title: str, user_id: str, file_path: str, tags: Optional[list] = None
) -> bool:
    """Inserts a record into the pdfs table."""
    try:
        if get_pdf_record_by_title(title, user_id):
            return True

        insert_data = {
            "title": title,
            "auth0_id": user_id,
            "file_path": file_path,
            "created_at": datetime.utcnow().isoformat(),
        }

        if tags is not None:
            insert_data["tags"] = tags

        result = supabase.table("pdfs").insert(insert_data).execute()
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


# TODO: finish chat functions
def insert_chat_record(
    user_id: str,
    chat_history: list,
    chat_id: str,
    chat_name: str,
) -> bool:
    """Inserts a record into the chats table."""
    try:
        result = (
            supabase.table("chats")
            .upsert(
                {
                    "auth0_id": user_id,
                    "chat_id": chat_id,
                    "chat_name": chat_name,
                    "chat_history": chat_history,
                },
                on_conflict="chat_id",
            )
            .execute()
        )
        return True
    except Exception as e:
        print("Exception inserting into chats table:", e)
        return False


def get_chat_record_by_name(user_id: str, chat_name: str) -> Optional[dict]:
    """Gets a record from the chats table by name and user_id."""
    try:
        result = (
            supabase.table("chats")
            .select("*")
            .eq("auth0_id", user_id)
            .eq("chat_name", chat_name)
            .execute()
        )
        return result.data[0] if result.data else None
    except Exception as e:
        print("Exception getting chat record:", e)
        return None


def delete_chat_record(user_id: str, chat_name: str) -> bool:
    """Removes a record from the chats table."""
    try:
        result = (
            supabase.table("chats")
            .delete()
            .eq("auth0_id", user_id)
            .eq("chat_name", chat_name)
            .execute()
        )
        return True
    except Exception as e:
        print("Exception removing chat record:", e)
        return False


def get_chat_record_by_id(chat_id: str, user_id: str) -> Optional[dict]:
    """Gets a record from the chats table by id."""
    try:
        result = (
            supabase.table("chats")
            .select("*")
            .eq("chat_id", chat_id)
            .eq("auth0_id", user_id)
            .execute()
        )
        return result.data[0] if result.data else None
    except Exception as e:
        print("Exception getting chat record:", e)
        return None


def get_chat_list_by_user_id(user_id: str) -> Optional[list]:
    """Gets a list of chat records from the chats table by user_id."""
    print("user_id", user_id)
    try:
        result = (
            supabase.table("chats")
            .select("chat_id, chat_name, chat_history, created_at")
            .eq("auth0_id", user_id)
            .execute()
        )
        return result.data if result.data else None
    except Exception as e:
        print("Exception getting chat list:", e)
        return None


def get_chat_name(chat_id: str, user_id: str) -> Optional[str]:
    """Gets a chat name from the chats table by id."""
    try:
        result = (
            supabase.table("chats")
            .select("chat_name")
            .eq("chat_id", chat_id)
            .eq("auth0_id", user_id)
            .execute()
        )
        return result.data[0]["chat_name"] if result.data else None
    except Exception as e:
        print("Exception getting chat name:", e)
        return None


def delete_chat_record_by_id(chat_id: str, user_id: str) -> bool:
    """Deletes a record from the chats table by id."""
    try:
        result = (
            supabase.table("chats")
            .delete()
            .eq("chat_id", chat_id)
            .eq("auth0_id", user_id)
            .execute()
        )
        return True
    except Exception as e:
        print("Exception deleting chat record:", e)
        return False
