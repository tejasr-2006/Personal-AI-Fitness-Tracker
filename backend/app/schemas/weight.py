from datetime import date
from pydantic import BaseModel, Field


class WeightCreate(BaseModel):
    date: date
    weight: float = Field(gt=20, lt=500)


class WeightResponse(WeightCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True