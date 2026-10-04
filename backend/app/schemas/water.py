from datetime import date
from pydantic import BaseModel


class WaterCreate(BaseModel):
    date: date
    amount: float


class WaterResponse(WaterCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True