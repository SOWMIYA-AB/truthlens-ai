from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1.health import router as health_router
from app.core.config import settings
from app.db.mongodb import close_mongo_connection, connect_to_mongo
from app.modules.analyses.routes import router as analyses_router
from app.modules.auth.routes import router as auth_router
from app.modules.uploads.routes import router as uploads_router
from app.modules.users.routes import router as users_router

Path(settings.resolved_upload_storage_dir).mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="TruthLens AI API foundation for digital trust and forensics workflows.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api/v1", tags=["health"])
app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(uploads_router, prefix="/api/v1")
app.include_router(analyses_router, prefix="/api/v1")
app.mount(settings.upload_url_prefix, StaticFiles(directory=settings.resolved_upload_storage_dir), name="uploads")
