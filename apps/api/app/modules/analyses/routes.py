from fastapi import APIRouter, Depends, status

from app.modules.analyses.schemas import ImageAnalysisRequest, ImageAnalysisResponse
from app.modules.analyses.service import analyze_uploaded_image
from app.modules.auth.dependencies import get_current_user

router = APIRouter(prefix="/analysis", tags=["analysis"])


@router.post("/image", response_model=ImageAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def analyze_image(payload: ImageAnalysisRequest, current_user: dict = Depends(get_current_user)):
    return await analyze_uploaded_image(payload.uploadId, str(current_user["_id"]))
