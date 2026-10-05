from datetime import date
from pydantic import BaseModel, Field


class WaterCreate(BaseModel):
    date: date
    amount: float = Field(gt=0, le=10000)


class WaterResponse(WaterCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True