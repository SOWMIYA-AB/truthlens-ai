from pydantic import BaseModel


class ImageUploadResponse(BaseModel):
    id: str
    filename: str
    uploadedAt: str
    imageUrl: str

