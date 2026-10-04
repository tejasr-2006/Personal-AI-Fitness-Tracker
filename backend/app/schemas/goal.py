from pydantic import BaseModel


class GoalResponse(BaseModel):
    id: int
    user_id: int
    goal_type: str

    bmr: float | None
    tdee: float | None
    maintenance_calories: float | None
    target_calories: float | None

    protein: float | None
    carbs: float | None
    fat: float | None

    water: float | None

    class Config:
        from_attributes = True