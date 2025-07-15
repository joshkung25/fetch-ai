import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_add_doc_route():
    try:
        file_path = "public/Josh_Kung_Resume_2025_v4.pdf"
        with open(file_path, "rb") as f:
            response = client.post(
                "/add",
                files={"file": ("Josh_Kung_Resume_2025_v4.pdf", f, "application/pdf")},
                data={"title": "Josh Kung Resume"},
            )
        print(response.json())
        return response.status_code == 200 and response.json()["status"] == "ok"
    except Exception as e:
        print(e)
        return False


print(test_add_doc_route())
