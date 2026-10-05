from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.goal import Goal
from app.services.analytics_service import get_progress_summary
from app.services.report_service import generate_fitness_report
from app.services.ai_client import AIUnavailable
from app.utils.auth import get_current_user


def _ai_call(fn, *args, **kwargs):
    try:
        return fn(*args, **kwargs)
    except AIUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=502, detail="The AI service failed. Please try again.")


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
        raise HTTPException(status_code=409, detail="Complete your profile first.")

    if not goal:
        raise HTTPException(status_code=409, detail="Calculate your fitness goals first.")

    progress = get_progress_summary(
        db=db,
        user_id=current_user.id,
        days=7
    )

    return _ai_call(generate_fitness_report,
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
        raise HTTPException(status_code=409, detail="Complete your profile first.")

    if not goal:
        raise HTTPException(status_code=409, detail="Calculate your fitness goals first.")

    progress = get_progress_summary(
        db=db,
        user_id=current_user.id,
        days=30
    )

    return _ai_call(generate_fitness_report,
        profile=profile,
        goal=goal,
        progress=progress,
        period="monthly"
    )
