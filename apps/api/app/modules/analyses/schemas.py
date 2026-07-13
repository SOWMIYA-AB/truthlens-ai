from pydantic import BaseModel, Field


class ImageAnalysisRequest(BaseModel):
    uploadId: str = Field(min_length=1)


class ImageAnalysisResponse(BaseModel):
    id: str
    uploadId: str
    prediction: str
    confidence: float
    truthScore: float
    model: str
    processingTime: float
    createdAt: str

