from datetime import date
from pydantic import BaseModel


class DailyLogCreate(BaseModel):
    date: date

    weight: float | None = None

    calories_consumed: float | None = None
    calories_burned: float | None = None

    protein: float | None = None
    carbohydrates: float | None = None
    fat: float | None = None
    fiber: float | None = None

    water: float | None = None
    steps: int | None = None

    workout_completed: bool = False

    sleep_duration: float | None = None
    sleep_quality: str | None = None

    supplements_completed: int = 0
    supplements_total: int = 0

    mood: str | None = None
    energy: int | None = None

    notes: str | None = None


class DailyLogResponse(DailyLogCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True