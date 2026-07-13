from pathlib import Path
from tempfile import TemporaryDirectory

from bson import ObjectId
from fastapi.testclient import TestClient

from app.core.config import settings
from app.main import app
from app.modules.analyses import service as analysis_service
from app.modules.auth.dependencies import get_current_user


class InsertOneResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class FakeCollection:
    def __init__(self, documents=None):
        self.documents = documents or []

    async def find_one(self, query):
        for document in self.documents:
            if all(document.get(key) == value for key, value in query.items()):
                return document
        return None

    async def insert_one(self, document):
        document["_id"] = ObjectId()
        self.documents.append(document)
        return InsertOneResult(document["_id"])


class FakeDatabase:
    def __init__(self, upload):
        self.uploads = FakeCollection([upload])
        self.analyses = FakeCollection()


class FakeImageModel:
    model_name = "EfficientNet-B3"

    def predict(self, image_path: Path):
        assert image_path.exists()
        return {
            "prediction": "Likely Authentic",
            "confidence": 91.25,
            "truthScore": 91.25,
            "model": self.model_name,
        }


async def fake_current_user():
    return {
        "_id": ObjectId("64f000000000000000000001"),
        "role": "user",
        "status": "active",
        "email": "analyst@example.com",
        "fullName": "Analyst",
    }


def assert_status(response, expected_status):
    assert response.status_code == expected_status, response.text


def run_smoke_test():
    original_storage_dir = settings.upload_storage_dir
    original_model = analysis_service.image_authenticity_model
    upload_id = ObjectId("64f000000000000000000002")
    user_id = "64f000000000000000000001"

    with TemporaryDirectory() as temporary_directory:
        settings.upload_storage_dir = temporary_directory
        image_path = Path(settings.resolved_upload_storage_dir) / "sample.png"
        image_path.write_bytes(b"\x89PNG\r\n\x1a\ntruthlens")

        fake_database = FakeDatabase(
            {
                "_id": upload_id,
                "userId": user_id,
                "filename": "sample.png",
                "originalFilename": "sample.png",
                "fileSize": image_path.stat().st_size,
                "mimeType": "image/png",
            }
        )
        analysis_service.get_database = lambda: fake_database
        analysis_service.image_authenticity_model = FakeImageModel()
        app.dependency_overrides[get_current_user] = fake_current_user

        client = TestClient(app)
        response = client.post("/api/v1/analysis/image", json={"uploadId": str(upload_id)})
        assert_status(response, 201)
        body = response.json()
        assert body["uploadId"] == str(upload_id)
        assert body["prediction"] == "Likely Authentic"
        assert body["confidence"] == 91.25
        assert body["truthScore"] == 91.25
        assert body["model"] == "EfficientNet-B3"
        assert body["processingTime"] >= 0
        assert len(fake_database.analyses.documents) == 1
        stored = fake_database.analyses.documents[0]
        assert stored["userId"] == user_id
        assert stored["uploadId"] == str(upload_id)
        assert stored["prediction"] == "Likely Authentic"

        missing = client.post("/api/v1/analysis/image", json={"uploadId": str(ObjectId())})
        assert_status(missing, 404)

        invalid = client.post("/api/v1/analysis/image", json={"uploadId": "not-valid"})
        assert_status(invalid, 400)

    settings.upload_storage_dir = original_storage_dir
    analysis_service.image_authenticity_model = original_model
    app.dependency_overrides.clear()
    print("analysis endpoint smoke test passed")


if __name__ == "__main__":
    run_smoke_test()

