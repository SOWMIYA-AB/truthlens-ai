from bson import ObjectId
from fastapi.testclient import TestClient
from pymongo.errors import DuplicateKeyError

from app.core.security import create_access_token
from app.main import app
from app.modules.auth import service as auth_service
from app.modules.users import routes as user_routes


class InsertOneResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class FakeCursor:
    def __init__(self, documents):
        self.documents = documents

    def sort(self, *_):
        self.documents = sorted(self.documents, key=lambda item: item["createdAt"], reverse=True)
        return self

    async def to_list(self, length):
        return self.documents[:length]


class FakeUsersCollection:
    def __init__(self):
        self.documents = []

    async def insert_one(self, document):
        if any(existing["email"] == document["email"] for existing in self.documents):
            raise DuplicateKeyError("duplicate email")

        document["_id"] = ObjectId()
        self.documents.append(document)
        return InsertOneResult(document["_id"])

    async def find_one(self, query):
        for document in self.documents:
            if self._matches(document, query):
                return document
        return None

    async def update_one(self, query, update):
        document = await self.find_one(query)
        if document is None:
            return None

        for key, value in update.get("$set", {}).items():
            if key == "refreshTokens.$.revokedAt":
                token_hash = query.get("refreshTokens.tokenHash")
                for token in document["refreshTokens"]:
                    if token["tokenHash"] == token_hash:
                        token["revokedAt"] = value
            else:
                document[key] = value

        for key, value in update.get("$push", {}).items():
            document.setdefault(key, []).append(value)

        return None

    def find(self):
        return FakeCursor(self.documents.copy())

    @staticmethod
    def _matches(document, query):
        for key, value in query.items():
            if key == "refreshTokens.tokenHash":
                if not any(token["tokenHash"] == value for token in document.get("refreshTokens", [])):
                    return False
            elif document.get(key) != value:
                return False
        return True


class FakeDatabase:
    def __init__(self):
        self.users = FakeUsersCollection()


def assert_status(response, expected_status):
    assert response.status_code == expected_status, response.text


def run_smoke_test():
    fake_database = FakeDatabase()
    auth_service.get_database = lambda: fake_database
    user_routes.get_database = lambda: fake_database

    client = TestClient(app)

    health = client.get("/api/v1/health")
    assert_status(health, 200)

    signup = client.post(
        "/api/v1/auth/signup",
        json={"fullName": "TruthLens User", "email": "user@example.com", "password": "Secure123"},
    )
    assert_status(signup, 201)
    signup_body = signup.json()
    access_token = signup_body["tokens"]["accessToken"]
    refresh_token = signup_body["tokens"]["refreshToken"]
    verification_token = signup_body["emailVerificationToken"]

    duplicate_signup = client.post(
        "/api/v1/auth/signup",
        json={"fullName": "TruthLens User", "email": "user@example.com", "password": "Secure123"},
    )
    assert_status(duplicate_signup, 409)

    login = client.post("/api/v1/auth/login", json={"email": "user@example.com", "password": "Secure123"})
    assert_status(login, 200)
    login_body = login.json()
    access_token = login_body["tokens"]["accessToken"]
    refresh_token = login_body["tokens"]["refreshToken"]
    auth_header = {"Authorization": f"Bearer {access_token}"}

    auth_me = client.get("/api/v1/auth/me", headers=auth_header)
    assert_status(auth_me, 200)

    users_me = client.get("/api/v1/users/me", headers=auth_header)
    assert_status(users_me, 200)

    update_profile = client.patch("/api/v1/users/me", json={"fullName": "Updated User"}, headers=auth_header)
    assert_status(update_profile, 200)
    assert update_profile.json()["fullName"] == "Updated User"

    verify_email = client.post("/api/v1/auth/verify-email", json={"token": verification_token})
    assert_status(verify_email, 200)

    forgot_password = client.post("/api/v1/auth/forgot-password", json={"email": "user@example.com"})
    assert_status(forgot_password, 200)
    reset_token = forgot_password.json()["resetToken"]

    reset_password = client.post(
        "/api/v1/auth/reset-password",
        json={"token": reset_token, "password": "NewSecure123"},
    )
    assert_status(reset_password, 200)

    login_after_reset = client.post("/api/v1/auth/login", json={"email": "user@example.com", "password": "NewSecure123"})
    assert_status(login_after_reset, 200)
    refresh_token = login_after_reset.json()["tokens"]["refreshToken"]

    refresh = client.post("/api/v1/auth/refresh", json={"refreshToken": refresh_token})
    assert_status(refresh, 200)
    rotated_refresh_token = refresh.json()["tokens"]["refreshToken"]

    logout = client.post("/api/v1/auth/logout", json={"refreshToken": rotated_refresh_token})
    assert_status(logout, 200)

    unauthorized_admin = client.get("/api/v1/users", headers=auth_header)
    assert_status(unauthorized_admin, 403)

    user_document = fake_database.users.documents[0]
    user_document["role"] = "admin"
    admin_access_token = create_access_token(str(user_document["_id"]), "admin")
    admin_users = client.get("/api/v1/users", headers={"Authorization": f"Bearer {admin_access_token}"})
    assert_status(admin_users, 200)

    print("auth endpoint smoke test passed")


if __name__ == "__main__":
    run_smoke_test()
