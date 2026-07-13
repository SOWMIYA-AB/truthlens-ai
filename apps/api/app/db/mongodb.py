from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING
from pymongo.errors import PyMongoError

from app.core.config import settings

client: AsyncIOMotorClient | None = None


async def connect_to_mongo() -> None:
    global client
    client = AsyncIOMotorClient(settings.mongodb_uri, serverSelectionTimeoutMS=2000)
    await ensure_database_indexes()


async def close_mongo_connection() -> None:
    global client
    if client is not None:
        client.close()
        client = None


def get_database():
    if client is None:
        raise RuntimeError("MongoDB client is not initialized")

    return client[settings.mongodb_database]


async def ensure_database_indexes() -> None:
    if client is None:
        return

    database = client[settings.mongodb_database]
    try:
        await database.users.create_index([("email", ASCENDING)], unique=True)
        await database.users.create_index([("role", ASCENDING)])
        await database.users.create_index([("createdAt", ASCENDING)])
        await database.uploads.create_index([("userId", ASCENDING)])
        await database.uploads.create_index([("createdAt", ASCENDING)])
        await database.analyses.create_index([("userId", ASCENDING)])
        await database.analyses.create_index([("uploadId", ASCENDING)])
        await database.analyses.create_index([("createdAt", ASCENDING)])
    except PyMongoError:
        return


async def ping_mongo() -> str:
    if client is None:
        return "disconnected"

    try:
        await client.admin.command("ping")
    except Exception:
        return "unreachable"

    return "connected"
