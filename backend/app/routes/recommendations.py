from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.goal import Goal
from app.models.ai_recommendation import AIRecommendation
from app.services.analytics_service import get_progress_summary
from app.services.recommendation_service import (
    generate_recommendations
)
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/recommendations",
    tags=["AI Recommendations"]
)


@router.post("/generate")
def generate_ai_recommendations(
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

    result = generate_recommendations(
        profile=profile,
        goal=goal,
        progress=progress
    )

    recommendations = []

    for item in result.get("recommendations", []):
        recommendation = AIRecommendation(
            user_id=current_user.id,
            date=date.today(),
            category=item.get("category", "general"),
            recommendation=item.get(
                "recommendation",
                ""
            ),
            priority=item.get("priority", "medium"),
            status="active"
        )

        db.add(recommendation)
        recommendations.append(recommendation)

    db.commit()

    return {
        "message": "Recommendations generated",
        "recommendations": result.get(
            "recommendations",
            []
        )
    }


@router.get(
    "",
)
def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(AIRecommendation)
        .filter(
            AIRecommendation.user_id == current_user.id
        )
        .order_by(
            AIRecommendation.date.desc(),
            AIRecommendation.id.desc()
        )
        .all()
    )