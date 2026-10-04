from datetime import date

from pydantic import BaseModel


class WorkoutCreate(BaseModel):
    name: str
    date: date
    duration_minutes: int | None = None
    notes: str | None = None


class WorkoutResponse(WorkoutCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class ExerciseCreate(BaseModel):
    name: str
    muscle_group: str | None = None
    equipment: str | None = None
    difficulty: str | None = None
    instructions: str | None = None
    calories_per_minute: float | None = None


class ExerciseResponse(ExerciseCreate):
    id: int

    class Config:
        from_attributes = True


class ExerciseLogCreate(BaseModel):
    exercise_id: int
    sets: int | None = None
    reps: int | None = None
    weight: float | None = None
    duration_minutes: int | None = None