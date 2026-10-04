from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.workout import Workout
from app.models.exercise import Exercise
from app.models.exercise_log import ExerciseLog
from app.schemas.workout import (
    WorkoutCreate,
    WorkoutResponse,
    ExerciseCreate,
    ExerciseResponse,
    ExerciseLogCreate
)
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/workouts",
    tags=["Workouts"]
)


@router.post("", response_model=WorkoutResponse)
def create_workout(
    data: WorkoutCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    workout = Workout(
        user_id=current_user.id,
        **data.model_dump()
    )

    db.add(workout)
    db.commit()
    db.refresh(workout)

    return workout


@router.get("", response_model=list[WorkoutResponse])
def get_workouts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Workout).filter(
        Workout.user_id == current_user.id
    ).order_by(Workout.date.desc()).all()


@router.post("/exercises", response_model=ExerciseResponse)
def create_exercise(
    data: ExerciseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    exercise = Exercise(**data.model_dump())

    db.add(exercise)
    db.commit()
    db.refresh(exercise)

    return exercise


@router.get("/exercises", response_model=list[ExerciseResponse])
def get_exercises(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(Exercise).order_by(
        Exercise.name.asc()
    ).all()


@router.post("/{workout_id}/exercises")
def add_exercise_to_workout(
    workout_id: int,
    data: ExerciseLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    workout = db.query(Workout).filter(
        Workout.id == workout_id,
        Workout.user_id == current_user.id
    ).first()

    if not workout:
        raise HTTPException(
            status_code=404,
            detail="Workout not found"
        )

    exercise = db.query(Exercise).filter(
        Exercise.id == data.exercise_id
    ).first()

    if not exercise:
        raise HTTPException(
            status_code=404,
            detail="Exercise not found"
        )

    exercise_log = ExerciseLog(
        workout_id=workout.id,
        **data.model_dump()
    )

    db.add(exercise_log)
    db.commit()
    db.refresh(exercise_log)

    return exercise_log