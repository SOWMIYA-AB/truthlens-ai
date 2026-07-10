from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.core.config import settings
from app.core.security import utc_now
from app.db.mongodb import get_database

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
CHUNK_SIZE = 1024 * 1024


def get_upload_directory() -> Path:
    directory = Path(settings.resolved_upload_storage_dir)
    directory.mkdir(parents=True, exist_ok=True)
    return directory


def validate_image_filename(filename: str | None) -> str:
    if not filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image filename is required")

    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported image extension. Use JPG, JPEG, PNG, or WEBP",
        )

    return filename


def validate_content_type(content_type: str | None) -> str:
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported image type. Use JPG, JPEG, PNG, or WEBP",
        )

    return content_type


def has_valid_signature(content_type: str, data: bytes) -> bool:
    if content_type == "image/jpeg":
        return data.startswith(b"\xff\xd8\xff")
    if content_type == "image/png":
        return data.startswith(b"\x89PNG\r\n\x1a\n")
    if content_type == "image/webp":
        return len(data) >= 12 and data.startswith(b"RIFF") and data[8:12] == b"WEBP"
    return False


async def save_image_upload(file: UploadFile, user_id: str, base_url: str) -> dict:
    original_filename = validate_image_filename(file.filename)
    content_type = validate_content_type(file.content_type)
    suffix = ALLOWED_IMAGE_TYPES[content_type]
    unique_filename = f"{uuid4().hex}{suffix}"
    upload_path = get_upload_directory() / unique_filename

    total_size = 0
    first_chunk = True

    try:
        with upload_path.open("wb") as destination:
            while True:
                chunk = await file.read(CHUNK_SIZE)
                if not chunk:
                    break

                if first_chunk:
                    first_chunk = False
                    if not has_valid_signature(content_type, chunk):
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="File content does not match the declared image type",
                        )

                total_size += len(chunk)
                if total_size > settings.max_image_upload_bytes:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"Image must be {settings.max_image_upload_mb} MB or smaller",
                    )

                destination.write(chunk)

        if total_size == 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded image is empty")
    except HTTPException:
        upload_path.unlink(missing_ok=True)
        raise
    finally:
        await file.close()

    now = utc_now()
    image_url = f"{base_url.rstrip('/')}{settings.upload_url_prefix}/{unique_filename}"
    document = {
        "userId": user_id,
        "filename": unique_filename,
        "originalFilename": original_filename,
        "fileSize": total_size,
        "mimeType": content_type,
        "createdAt": now,
    }

    database = get_database()
    result = await database.uploads.insert_one(document)

    return {
        "id": str(result.inserted_id),
        "filename": unique_filename,
        "uploadedAt": now.isoformat(),
        "imageUrl": image_url,
    }
