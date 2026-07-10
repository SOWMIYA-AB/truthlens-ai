from fastapi import APIRouter

from app.core.config import settings
from app.db.mongodb import ping_mongo

router = APIRouter()


@router.get("/health")
async def health_check():
    database_status = await ping_mongo()

    return {
        "status": "ok" if database_status == "connected" else "degraded",
        "service": settings.app_name,
        "environment": settings.app_env,
        "database": database_status,
    }

