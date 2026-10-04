from datetime import date
from pydantic import BaseModel


class ProgressPhotoCreate(BaseModel):
    date: date
    photo_url: str
    photo_type: str | None = None
    notes: str | None = None


class ProgressPhotoResponse(ProgressPhotoCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True