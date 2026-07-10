from pathlib import Path
from tempfile import TemporaryDirectory

from bson import ObjectId
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from app.modules.auth.dependencies import get_current_user
from app.modules.uploads import service as upload_service


class InsertOneResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class FakeUploadsCollection:
    def __init__(self):
        self.documents = []

    async def insert_one(self, document):
        document["_id"] = ObjectId()
        self.documents.append(document)
        return InsertOneResult(document["_id"])


class FakeDatabase:
    def __init__(self):
        self.uploads = FakeUploadsCollection()


async def fake_current_user():
    return {
        "_id": ObjectId(),
        "role": "user",
        "status": "active",
        "email": "uploader@example.com",
        "fullName": "Uploader",
    }


def assert_status(response, expected_status):
    assert response.status_code == expected_status, response.text


def run_smoke_test():
    fake_database = FakeDatabase()
    original_storage_dir = settings.upload_storage_dir
    original_max_mb = settings.max_image_upload_mb
    upload_service.get_database = lambda: fake_database
    app.dependency_overrides[get_current_user] = fake_current_user

    with TemporaryDirectory() as temporary_directory:
        settings.upload_storage_dir = temporary_directory
        settings.max_image_upload_mb = 20

        client = TestClient(app)

        valid_png = b"\x89PNG\r\n\x1a\n" + b"truthlens-image"
        valid_upload = client.post(
            "/api/v1/uploads/image",
            files={"image": ("sample.png", valid_png, "image/png")},
        )
        assert_status(valid_upload, 201)
        body = valid_upload.json()
        assert body["id"]
        assert body["filename"].endswith(".png")
        assert body["uploadedAt"]
        assert body["imageUrl"].endswith(body["filename"])
        assert (Path(temporary_directory) / body["filename"]).exists()

        stored = fake_database.uploads.documents[0]
        assert stored["filename"] == body["filename"]
        assert stored["originalFilename"] == "sample.png"
        assert stored["fileSize"] == len(valid_png)
        assert stored["mimeType"] == "image/png"
        assert stored["userId"]
        assert stored["createdAt"]

        unsupported_upload = client.post(
            "/api/v1/uploads/image",
            files={"image": ("notes.txt", b"not-image", "text/plain")},
        )
        assert_status(unsupported_upload, 400)

        invalid_signature = client.post(
            "/api/v1/uploads/image",
            files={"image": ("fake.png", b"not-a-real-png", "image/png")},
        )
        assert_status(invalid_signature, 400)

        settings.max_image_upload_mb = 0
        oversized_upload = client.post(
            "/api/v1/uploads/image",
            files={"image": ("large.png", valid_png, "image/png")},
        )
        assert_status(oversized_upload, 413)

    settings.upload_storage_dir = original_storage_dir
    settings.max_image_upload_mb = original_max_mb
    app.dependency_overrides.clear()
    print("upload endpoint smoke test passed")


if __name__ == "__main__":
    run_smoke_test()
