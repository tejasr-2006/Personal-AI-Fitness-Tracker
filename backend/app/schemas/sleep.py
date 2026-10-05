from datetime import date
from pydantic import BaseModel, Field


class SleepCreate(BaseModel):
    date: date
    duration_hours: float = Field(ge=0, le=24)
    sleep_quality: str | None = None
    bedtime: str | None = None
    wake_time: str | None = None
    notes: str | None = None


class SleepResponse(SleepCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True
        