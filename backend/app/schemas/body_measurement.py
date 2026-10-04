from datetime import date
from pydantic import BaseModel


class BodyMeasurementCreate(BaseModel):
    date: date

    waist: float | None = None
    chest: float | None = None
    hips: float | None = None
    neck: float | None = None
    left_arm: float | None = None
    right_arm: float | None = None
    left_thigh: float | None = None
    right_thigh: float | None = None


class BodyMeasurementResponse(BodyMeasurementCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True