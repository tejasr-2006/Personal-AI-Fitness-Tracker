from sqlalchemy.orm import Session

from app.models.meal import Meal
from app.models.goal import Goal


def calculate_daily_totals(
    db: Session,
    user_id: int,
    meal_date
):
    meals = db.query(Meal).filter(
        Meal.user_id == user_id,
        Meal.date == meal_date
    ).all()

    calories = sum(meal.calories or 0 for meal in meals)
    protein = sum(meal.protein or 0 for meal in meals)
    carbs = sum(meal.carbohydrates or 0 for meal in meals)
    fat = sum(meal.fat or 0 for meal in meals)
    fiber = sum(meal.fiber or 0 for meal in meals)

    goal = db.query(Goal).filter(
        Goal.user_id == user_id
    ).first()

    target_calories = goal.target_calories if goal else None
    target_protein = goal.protein if goal else None

    return {
        "date": meal_date,
        "calories_consumed": round(calories, 2),
        "calories_remaining": (
            round(max(target_calories - calories, 0), 2)
            if target_calories is not None
            else None
        ),
        "protein_consumed": round(protein, 2),
        "protein_remaining": (
            round(max(target_protein - protein, 0), 2)
            if target_protein is not None
            else None
        ),
        "carbohydrates": round(carbs, 2),
        "fat": round(fat, 2),
        "fiber": round(fiber, 2)
    }