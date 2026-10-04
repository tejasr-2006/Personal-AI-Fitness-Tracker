from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.activity import Activity
from app.models.user import User
from app.schemas.activity import ActivityCreate, ActivityResponse
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/activities",
    tags=["Activities"]
)


@router.post("", response_model=ActivityResponse)
def create_activity(
    data: ActivityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    activity = Activity(
        user_id=current_user.id,
        **data.model_dump()
    )

    db.add(activity)
    db.commit()
    db.refresh(activity)

    return activity


@router.get("", response_model=list[ActivityResponse])
def get_activities(
    activity_date: date | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Activity).filter(
        Activity.user_id == current_user.id
    )

    if activity_date:
        query = query.filter(
            Activity.date == activity_date
        )

    return query.order_by(Activity.date.desc()).all()


@router.get("/daily")
def get_daily_activity(
    activity_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    activities = db.query(Activity).filter(
        Activity.user_id == current_user.id,
        Activity.date == activity_date
    ).all()

    total_steps = sum(
        activity.steps or 0
        for activity in activities
    )

    total_calories = sum(
        activity.calories_burned or 0
        for activity in activities
    )

    total_duration = sum(
        activity.duration_minutes or 0
        for activity in activities
    )

    return {
        "date": activity_date,
        "steps": total_steps,
        "calories_burned": total_calories,
        "duration_minutes": total_duration
    }