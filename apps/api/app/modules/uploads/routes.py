from fastapi import APIRouter, Depends, File, Request, UploadFile, status

from app.modules.auth.dependencies import get_current_user
from app.modules.uploads.schemas import ImageUploadResponse
from app.modules.uploads.service import save_image_upload

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("/image", response_model=ImageUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_image(
    request: Request,
    image: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    return await save_image_upload(image, str(current_user["_id"]), str(request.base_url))
