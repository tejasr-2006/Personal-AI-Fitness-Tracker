import datetime as dt

from pydantic import BaseModel


class FoodLogRequest(BaseModel):
    text: str
    meal_type: str | None = None
    date: dt.date | None = None


class FoodItemAI(BaseModel):
    food_name: str
    quantity: float | None = None
    unit: str | None = None
    calories: float | None = None
    protein: float | None = None
    carbohydrates: float | None = None
    fat: float | None = None
    fiber: float | None = None


class FoodLogResponse(BaseModel):
    meal_type: str
    items: list[FoodItemAI]
