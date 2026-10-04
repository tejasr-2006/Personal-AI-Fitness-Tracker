from pydantic import BaseModel


class ProfileCreate(BaseModel):
    age: int | None = None
    gender: str | None = None

    height: float | None = None
    weight: float | None = None
    goal_weight: float | None = None

    activity_level: str | None = None
    fitness_level: str | None = None
    goal: str | None = None

    dietary_preferences: str | None = None
    food_preferences: str | None = None
    food_dislikes: str | None = None
    allergies: str | None = None

    equipment: str | None = None
    workout_location: str | None = None
    budget: float | None = None

    wake_time: str | None = None
    sleep_time: str | None = None


class ProfileResponse(ProfileCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True