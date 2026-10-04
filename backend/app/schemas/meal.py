from datetime import date
from pydantic import BaseModel


class MealCreate(BaseModel):
    date: date

    meal_type: str
    food_name: str

    quantity: float | None = None
    unit: str | None = None

    calories: float | None = None
    protein: float | None = None
    carbohydrates: float | None = None
    fat: float | None = None
    fiber: float | None = None


class MealResponse(MealCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True