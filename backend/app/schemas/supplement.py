from datetime import date
from pydantic import BaseModel


class SupplementCreate(BaseModel):
    name: str
    dosage: float | None = None
    unit: str | None = None
    date: date
    taken: bool = False


class SupplementResponse(SupplementCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True