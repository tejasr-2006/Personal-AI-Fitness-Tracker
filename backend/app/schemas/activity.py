from datetime import date

from pydantic import BaseModel


class ActivityCreate(BaseModel):
    date: date
    activity_type: str
    duration_minutes: int | None = None
    calories_burned: float | None = None
    steps: int | None = None
    notes: str | None = None


class ActivityResponse(ActivityCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True