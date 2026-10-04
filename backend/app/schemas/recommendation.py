from datetime import date
from pydantic import BaseModel


class RecommendationResponse(BaseModel):
    id: int
    user_id: int
    date: date
    category: str
    recommendation: str
    priority: str | None = None
    status: str

    class Config:
        from_attributes = True