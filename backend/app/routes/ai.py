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
from app.models.activity import Activity
from app.models.workout import Workout
from app.services.trainer_service import generate_trainer_advice
from app.schemas.coach import CoachRequest, CoachResponse
from app.models.activity import Activity
from app.models.workout import Workout
from app.services.coach_service import generate_coach_response
from app.models.sleep_log import SleepLog
from app.services.briefing_service import generate_daily_briefing

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

@router.get("/trainer-advice")
def get_trainer_advice(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
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
        return {"error": "Complete your profile first"}

    if not goal:
        return {"error": "Calculate your fitness goals first"}

    workouts = (
        db.query(Workout)
        .filter(Workout.user_id == current_user.id)
        .order_by(Workout.date.desc())
        .limit(10)
        .all()
    )

    activities = (
        db.query(Activity)
        .filter(Activity.user_id == current_user.id)
        .order_by(Activity.date.desc())
        .limit(10)
        .all()
    )

    advice = generate_trainer_advice(
        profile=profile,
        goal=goal,
        workouts=workouts,
        activities=activities
    )

    return advice

@router.post(
    "/coach",
    response_model=CoachResponse
)
def coach_chat(
    data: CoachRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
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
        return {"response": "Complete your profile first."}

    if not goal:
        return {
            "response": "Calculate your fitness goals first."
        }

    nutrition = calculate_daily_totals(
        db=db,
        user_id=current_user.id,
        meal_date=date.today()
    )

    workouts = (
        db.query(Workout)
        .filter(Workout.user_id == current_user.id)
        .order_by(Workout.date.desc())
        .limit(10)
        .all()
    )

    activities = (
        db.query(Activity)
        .filter(Activity.user_id == current_user.id)
        .order_by(Activity.date.desc())
        .limit(10)
        .all()
    )

    response = generate_coach_response(
        message=data.message,
        profile=profile,
        goal=goal,
        nutrition=nutrition,
        workouts=workouts,
        activities=activities
    )

    return {
        "response": response
    }

@router.get("/daily-briefing")
def get_daily_briefing(
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
        return {"error": "Complete your profile first"}

    if not goal:
        return {
            "error": "Calculate your fitness goals first"
        }

    nutrition = calculate_daily_totals(
        db=db,
        user_id=current_user.id,
        meal_date=today
    )

    activities = (
        db.query(Activity)
        .filter(
            Activity.user_id == current_user.id,
            Activity.date == today
        )
        .all()
    )

    activity = {
        "steps": sum(a.steps or 0 for a in activities),
        "calories_burned": sum(
            a.calories_burned or 0
            for a in activities
        ),
        "duration_minutes": sum(
            a.duration_minutes or 0
            for a in activities
        )
    }

    sleep = (
        db.query(SleepLog)
        .filter(
            SleepLog.user_id == current_user.id,
            SleepLog.date == today
        )
        .order_by(SleepLog.id.desc())
        .first()
    )

    if sleep:
        sleep_data = {
            "duration_hours": sleep.duration_hours,
            "quality": sleep.sleep_quality,
            "bedtime": sleep.bedtime,
            "wake_time": sleep.wake_time
        }
    else:
        sleep_data = {
            "duration_hours": 0,
            "quality": None
        }

    workouts = (
        db.query(Workout)
        .filter(
            Workout.user_id == current_user.id,
            Workout.date == today
        )
        .all()
    )

    briefing = generate_daily_briefing(
        profile=profile,
        goal=goal,
        nutrition=nutrition,
        activity=activity,
        sleep=sleep_data,
        workouts=workouts
    )

    return briefing