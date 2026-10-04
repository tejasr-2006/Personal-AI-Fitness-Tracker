from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.meal import Meal
from app.models.user import User
from app.schemas.ai import FoodLogRequest, FoodLogResponse
from app.services.ai_service import parse_food_text
from app.utils.auth import get_current_user
from datetime import date

from app.models.profile import Profile
from app.models.goal import Goal
from app.services.nutrition_service import calculate_daily_totals
from app.services.diet_service import generate_diet_advice

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/food-log", response_model=FoodLogResponse)
def ai_food_log(
    data: FoodLogRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = parse_food_text(
        data.text,
        data.meal_type
    )

    items = result["items"]
    meal_type = result["meal_type"]

    for item in items:
        meal = Meal(
            user_id=current_user.id,
            date=date.today(),
            meal_type=meal_type,
            food_name=item["food_name"],
            quantity=item.get("quantity"),
            unit=item.get("unit"),
            calories=item.get("calories"),
            protein=item.get("protein"),
            carbohydrates=item.get("carbohydrates"),
            fat=item.get("fat"),
            fiber=item.get("fiber")
        )

        db.add(meal)

    db.commit()

    return {
        "meal_type": meal_type,
        "items": items
    }

@router.get("/diet-advice")
def get_diet_advice(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(
        Profile.user_id == current_user.id
    ).first()

    goal = db.query(Goal).filter(
        Goal.user_id == current_user.id
    ).first()

    if not profile:
        return {"error": "Complete your profile first"}

    if not goal:
        return {"error": "Calculate your fitness goals first"}

    nutrition = calculate_daily_totals(
        db=db,
        user_id=current_user.id,
        meal_date=date.today()
    )

    advice = generate_diet_advice(
        profile=profile,
        goal=goal,
        nutrition=nutrition
    )

    return advice