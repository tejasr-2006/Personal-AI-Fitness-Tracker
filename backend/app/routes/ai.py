from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.activity import Activity
from app.models.goal import Goal
from app.models.meal import Meal
from app.models.profile import Profile
from app.models.sleep_log import SleepLog
from app.models.user import User
from app.models.workout import Workout
from app.schemas.ai import FoodLogRequest, FoodLogResponse
from app.schemas.coach import CoachRequest, CoachResponse
from app.services.ai_client import AIUnavailable
from app.services.ai_service import parse_food_text
from app.services.briefing_service import generate_daily_briefing
from app.services.coach_service import generate_coach_response
from app.services.diet_service import generate_diet_advice
from app.services.nutrition_service import calculate_daily_totals
from app.services.trainer_service import generate_trainer_advice
from app.utils.auth import get_current_user


router = APIRouter(prefix="/ai", tags=["AI"])


def _ai_call(fn, *args, **kwargs):
    try:
        return fn(*args, **kwargs)

    except AIUnavailable as exc:
        print(f"AI unavailable: {exc}", flush=True)

        raise HTTPException(
            status_code=503,
            detail=str(exc),
        )

    except Exception as exc:
        print(
            f"AI service error: {type(exc).__name__}: {exc}",
            flush=True,
        )

        raise HTTPException(
            status_code=502,
            detail="The AI service failed. Please try again.",
        )


def _require_profile_and_goal(db: Session, user: User):
    """Missing setup is a client error, not a 200 with an error body."""

    profile = (
        db.query(Profile)
        .filter(Profile.user_id == user.id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=409,
            detail="Complete your profile first.",
        )

    goal = (
        db.query(Goal)
        .filter(Goal.user_id == user.id)
        .first()
    )

    if not goal:
        raise HTTPException(
            status_code=409,
            detail="Calculate your fitness goals first.",
        )

    return profile, goal


def _recent(
    db: Session,
    model,
    user_id: int,
    limit: int = 10,
):
    return (
        db.query(model)
        .filter(model.user_id == user_id)
        .order_by(model.date.desc())
        .limit(limit)
        .all()
    )


@router.post(
    "/food-log",
    response_model=FoodLogResponse,
)
def ai_food_log(
    data: FoodLogRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not data.text.strip():
        raise HTTPException(
            status_code=422,
            detail="Describe what you ate.",
        )

    items = _ai_call(
        parse_food_text,
        data.text,
    )

    if not items:
        raise HTTPException(
            status_code=422,
            detail="No foods could be identified in that description.",
        )

    meal_type = data.meal_type or "snack"
    log_date = data.date or date.today()

    for item in items:
        db.add(
            Meal(
                user_id=current_user.id,
                date=log_date,
                meal_type=meal_type,
                food_name=item["food_name"],
                quantity=item.get("quantity"),
                unit=item.get("unit"),
                calories=item.get("calories"),
                protein=item.get("protein"),
                carbohydrates=item.get("carbohydrates"),
                fat=item.get("fat"),
                fiber=item.get("fiber"),
            )
        )

    db.commit()

    return {
        "meal_type": meal_type,
        "items": items,
    }


@router.get("/diet-advice")
def get_diet_advice(
    on_date: date | None = Query(
        None,
        alias="date",
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile, goal = _require_profile_and_goal(
        db,
        current_user,
    )

    nutrition = calculate_daily_totals(
        db=db,
        user_id=current_user.id,
        meal_date=on_date or date.today(),
    )

    return _ai_call(
        generate_diet_advice,
        profile=profile,
        goal=goal,
        nutrition=nutrition,
    )


@router.get("/trainer-advice")
def get_trainer_advice(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile, goal = _require_profile_and_goal(
        db,
        current_user,
    )

    return _ai_call(
        generate_trainer_advice,
        profile=profile,
        goal=goal,
        workouts=_recent(
            db,
            Workout,
            current_user.id,
        ),
        activities=_recent(
            db,
            Activity,
            current_user.id,
        ),
    )


@router.post(
    "/coach",
    response_model=CoachResponse,
)
def coach_chat(
    data: CoachRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile, goal = _require_profile_and_goal(
        db,
        current_user,
    )

    nutrition = calculate_daily_totals(
        db=db,
        user_id=current_user.id,
        meal_date=date.today(),
    )

    response = _ai_call(
        generate_coach_response,
        message=data.message,
        profile=profile,
        goal=goal,
        nutrition=nutrition,
        workouts=_recent(
            db,
            Workout,
            current_user.id,
        ),
        activities=_recent(
            db,
            Activity,
            current_user.id,
        ),
    )

    return {
        "response": response,
    }


@router.get("/daily-briefing")
def get_daily_briefing(
    on_date: date | None = Query(
        None,
        alias="date",
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = on_date or date.today()

    profile, goal = _require_profile_and_goal(
        db,
        current_user,
    )

    nutrition = calculate_daily_totals(
        db=db,
        user_id=current_user.id,
        meal_date=today,
    )

    activities = (
        db.query(Activity)
        .filter(
            Activity.user_id == current_user.id,
            Activity.date == today,
        )
        .all()
    )

    activity = {
        "steps": sum(
            a.steps or 0
            for a in activities
        ),
        "calories_burned": sum(
            a.calories_burned or 0
            for a in activities
        ),
        "duration_minutes": sum(
            a.duration_minutes or 0
            for a in activities
        ),
    }

    sleep = (
        db.query(SleepLog)
        .filter(
            SleepLog.user_id == current_user.id,
            SleepLog.date == today,
        )
        .order_by(
            SleepLog.id.desc()
        )
        .first()
    )

    sleep_data = (
        {
            "duration_hours": sleep.duration_hours,
            "quality": sleep.sleep_quality,
            "bedtime": sleep.bedtime,
            "wake_time": sleep.wake_time,
        }
        if sleep
        else {
            "duration_hours": 0,
            "quality": None,
        }
    )

    workouts = (
        db.query(Workout)
        .filter(
            Workout.user_id == current_user.id,
            Workout.date == today,
        )
        .all()
    )

    return _ai_call(
        generate_daily_briefing,
        profile=profile,
        goal=goal,
        nutrition=nutrition,
        activity=activity,
        sleep=sleep_data,
        workouts=workouts,
    )