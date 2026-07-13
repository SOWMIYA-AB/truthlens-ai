from pathlib import Path
from time import perf_counter

from bson import ObjectId
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.security import utc_now
from app.db.mongodb import get_database
from app.modules.analyses.image_model import image_authenticity_model


async def analyze_uploaded_image(upload_id: str, user_id: str) -> dict:
    if not ObjectId.is_valid(upload_id):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid upload id")

    database = get_database()
    upload = await database.uploads.find_one({"_id": ObjectId(upload_id), "userId": user_id})
    if upload is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Uploaded image not found")

    image_path = Path(settings.resolved_upload_storage_dir) / upload["filename"]
    if not image_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Stored image file not found")

    started_at = perf_counter()
    prediction = image_authenticity_model.predict(image_path)
    processing_time = round((perf_counter() - started_at) * 1000, 2)
    created_at = utc_now()

    document = {
        "userId": user_id,
        "uploadId": upload_id,
        "prediction": prediction["prediction"],
        "confidence": prediction["confidence"],
        "model": prediction["model"],
        "processingTime": processing_time,
        "createdAt": created_at,
    }
    result = await database.analyses.insert_one(document)

    return {
        "id": str(result.inserted_id),
        "uploadId": upload_id,
        "prediction": prediction["prediction"],
        "confidence": prediction["confidence"],
        "truthScore": prediction["truthScore"],
        "model": prediction["model"],
        "processingTime": processing_time,
        "createdAt": created_at.isoformat(),
    }

