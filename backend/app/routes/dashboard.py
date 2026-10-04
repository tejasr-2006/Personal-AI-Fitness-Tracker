from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.goal import Goal
from app.models.weight_log import WeightLog
from app.models.water_log import WaterLog
from app.models.activity import Activity
from app.models.sleep_log import SleepLog
from app.models.workout import Workout
from app.services.nutrition_service import calculate_daily_totals
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)


@router.get("")
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    today = date.today()

    profile = (
        db.query(Profile)
        .filter(Profile.user_id == current_user.id)
        .first()
    )

    goal = (
        db.query(Goal)
        .filter(Goal.user_id == current_user.id)
        .first()
    )

    if not profile:
        return {
            "error": "Complete your profile first"
        }

    if not goal:
        return {
            "error": "Calculate your fitness goals first"
        }

    # Nutrition
    nutrition = calculate_daily_totals(
        db=db,
        user_id=current_user.id,
        meal_date=today
    )

    # Water
    water_logs = (
        db.query(WaterLog)
        .filter(
            WaterLog.user_id == current_user.id,
            WaterLog.date == today
        )
        .all()
    )

    water = sum(
        item.amount or 0
        for item in water_logs
    )

    # Activity
    activities = (
        db.query(Activity)
        .filter(
            Activity.user_id == current_user.id,
            Activity.date == today
        )
        .all()
    )

    steps = sum(
        item.steps or 0
        for item in activities
    )

    calories_burned = sum(
        item.calories_burned or 0
        for item in activities
    )

    # Sleep
    sleep = (
        db.query(SleepLog)
        .filter(
            SleepLog.user_id == current_user.id,
            SleepLog.date == today
        )
        .order_by(SleepLog.id.desc())
        .first()
    )

    # Workouts
    workouts = (
        db.query(Workout)
        .filter(
            Workout.user_id == current_user.id,
            Workout.date == today
        )
        .all()
    )

    # Latest weight
    latest_weight = (
        db.query(WeightLog)
        .filter(
            WeightLog.user_id == current_user.id
        )
        .order_by(WeightLog.date.desc())
        .first()
    )

    return {
        "date": today,

        "profile": {
            "name": current_user.name,
            "age": profile.age,
            "weight": profile.weight,
            "goal_weight": profile.goal_weight,
            "goal": profile.goal,
            "fitness_level": profile.fitness_level
        },

        "targets": {
            "calories": goal.target_calories,
            "protein": goal.protein,
            "carbohydrates": goal.carbs,
            "fat": goal.fat,
            "water": goal.water
        },

        "nutrition": nutrition,

        "water": {
            "consumed_ml": water,
            "target_ml": goal.water,
            "remaining_ml": max(
                (goal.water or 0) - water,
                0
            )
        },

        "activity": {
            "steps": steps,
            "calories_burned": calories_burned
        },

        "sleep": {
            "duration_hours": (
                sleep.duration_hours
                if sleep else None
            ),
            "quality": (
                sleep.sleep_quality
                if sleep else None
            )
        },

        "workouts": {
            "count": len(workouts),
            "completed": len(workouts) > 0
        },

        "weight": {
            "current": (
                latest_weight.weight
                if latest_weight
                else profile.weight
            )
        }
    }