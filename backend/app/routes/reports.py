from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.goal import Goal
from app.services.analytics_service import get_progress_summary
from app.services.report_service import generate_fitness_report
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/reports",
    tags=["AI Reports"]
)


@router.get("/weekly")
def weekly_report(
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
        return {
            "error": "Calculate your fitness goals first"
        }

    progress = get_progress_summary(
        db=db,
        user_id=current_user.id
    )

    return generate_fitness_report(
        profile=profile,
        goal=goal,
        progress=progress,
        period="weekly"
    )

@router.get("/monthly")
def monthly_report(
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
        return {
            "error": "Calculate your fitness goals first"
        }

    progress = get_progress_summary(
        db=db,
        user_id=current_user.id
    )

    return generate_fitness_report(
        profile=profile,
        goal=goal,
        progress=progress,
        period="monthly"
    )    