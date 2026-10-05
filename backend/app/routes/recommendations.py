from datetime import date

from fastapi import APIRouter, Depends, HTTPException
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
from app.services.ai_client import AIUnavailable
from app.schemas.recommendation import RecommendationResponse
from app.utils.auth import get_current_user


def _ai_call(fn, *args, **kwargs):
    try:
        return fn(*args, **kwargs)
    except AIUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=502, detail="The AI service failed. Please try again.")


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
        raise HTTPException(status_code=409, detail="Complete your profile first.")

    if not goal:
        raise HTTPException(status_code=409, detail="Calculate your fitness goals first.")

    progress = get_progress_summary(
        db=db,
        user_id=current_user.id
    )

    result = _ai_call(generate_recommendations,
        profile=profile,
        goal=goal,
        progress=progress
    )

    recommendations = []
    items = result if isinstance(result, list) else result.get("recommendations", [])

    for item in items:
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
    for recommendation in recommendations:
        db.refresh(recommendation)

    return {
        "message": "Recommendations generated",
        "recommendations": [
            RecommendationResponse.model_validate(r).model_dump(mode="json")
            for r in recommendations
        ]
    }


@router.get(
    "",
    response_model=list[RecommendationResponse]
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