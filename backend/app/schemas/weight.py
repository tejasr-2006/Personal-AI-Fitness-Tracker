from datetime import date
from pydantic import BaseModel


class WeightCreate(BaseModel):
    date: date
    weight: float


class WeightResponse(WeightCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True