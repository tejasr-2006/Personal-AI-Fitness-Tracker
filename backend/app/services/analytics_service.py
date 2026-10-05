from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models.weight_log import WeightLog
from app.models.meal import Meal
from app.models.workout import Workout
from app.models.activity import Activity
from app.models.water_log import WaterLog
from app.models.sleep_log import SleepLog


def get_progress_summary(
    db: Session,
    user_id: int,
    days: int = 7
):
    today = date.today()
    start_date = today - timedelta(days=days)

    weights = (
        db.query(WeightLog)
        .filter(
            WeightLog.user_id == user_id,
            WeightLog.date >= start_date
        )
        .order_by(WeightLog.date.asc())
        .all()
    )

    meals = (
        db.query(Meal)
        .filter(
            Meal.user_id == user_id,
            Meal.date >= start_date
        )
        .all()
    )

    workouts = (
        db.query(Workout)
        .filter(
            Workout.user_id == user_id,
            Workout.date >= start_date
        )
        .all()
    )

    activities = (
        db.query(Activity)
        .filter(
            Activity.user_id == user_id,
            Activity.date >= start_date
        )
        .all()
    )

    water_logs = (
        db.query(WaterLog)
        .filter(
            WaterLog.user_id == user_id,
            WaterLog.date >= start_date
        )
        .all()
    )

    sleep_logs = (
        db.query(SleepLog)
        .filter(
            SleepLog.user_id == user_id,
            SleepLog.date >= start_date
        )
        .all()
    )

    total_calories = sum(
        meal.calories or 0
        for meal in meals
    )

    total_protein = sum(
        meal.protein or 0
        for meal in meals
    )

    total_steps = sum(
        activity.steps or 0
        for activity in activities
    )

    total_calories_burned = sum(
        activity.calories_burned or 0
        for activity in activities
    )

    total_water = sum(
        water.amount or 0
        for water in water_logs
    )

    total_sleep = sum(
        sleep.duration_hours or 0
        for sleep in sleep_logs
    )

    average_sleep = (
        total_sleep / len(sleep_logs)
        if sleep_logs
        else 0
    )

    weight_change = 0

    if len(weights) >= 2:
        weight_change = (
            weights[-1].weight - weights[0].weight
        )

    return {
        "period": {
            "days": days,
            "start": start_date,
            "end": today
        },

        "weight": {
            "current": weights[-1].weight if weights else None,
            "change": round(weight_change, 2),
            "history": [
                {
                    "date": weight.date,
                    "weight": weight.weight
                }
                for weight in weights
            ]
        },

        "nutrition": {
            "calories": round(total_calories, 2),
            "protein": round(total_protein, 2)
        },

        "activity": {
            "steps": total_steps,
            "calories_burned": round(
                total_calories_burned,
                2
            )
        },

        "workouts": {
            "count": len(workouts)
        },

        "water": {
            "total_ml": round(total_water, 2)
        },

        "sleep": {
            "average_hours": round(
                average_sleep,
                2
            )
        }
    }