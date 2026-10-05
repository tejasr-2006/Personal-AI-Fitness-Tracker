from pydantic import BaseModel, ConfigDict, Field


class ProfileCreate(BaseModel):
    age: int | None = Field(None, ge=10, le=120)
    gender: str | None = None

    height: float | None = Field(None, gt=50, lt=272)
    weight: float | None = Field(None, gt=20, lt=500)
    goal_weight: float | None = Field(None, gt=20, lt=500)

    activity_level: str | None = None
    fitness_level: str | None = None
    goal: str | None = None

    dietary_preferences: str | None = None
    food_preferences: str | None = None
    food_dislikes: str | None = None
    allergies: str | None = None

    equipment: str | None = None
    workout_location: str | None = None
    budget: float | None = Field(None, ge=0)

    wake_time: str | None = None
    sleep_time: str | None = None


class ProfileResponse(ProfileCreate):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)