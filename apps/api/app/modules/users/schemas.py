from pydantic import BaseModel, Field


class UpdateProfileRequest(BaseModel):
    fullName: str = Field(min_length=2, max_length=120)

