from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.profile import Profile
from app.models.goal import Goal
from app.schemas.goal import GoalResponse
from app.services.fitness_calculator import calculate_fitness_targets
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/goals",
    tags=["Goals"]
)


@router.post(
    "/calculate",
    response_model=GoalResponse
)
def calculate_goal(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    profile = db.query(Profile).filter(
        Profile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    required_fields = [
        profile.age,
        profile.gender,
        profile.height,
        profile.weight,
        profile.activity_level,
        profile.goal
    ]

    if any(value is None for value in required_fields):
        raise HTTPException(
            status_code=400,
            detail="Complete your profile first"
        )

    targets = calculate_fitness_targets(profile)

    goal = db.query(Goal).filter(
        Goal.user_id == current_user.id
    ).first()

    if goal:
        for key, value in targets.items():
            setattr(goal, key, value)

        goal.goal_type = profile.goal

    else:
        goal = Goal(
            user_id=current_user.id,
            goal_type=profile.goal,
            **targets
        )

        db.add(goal)

    db.commit()
    db.refresh(goal)

    return goal


@router.get(
    "",
    response_model=GoalResponse
)
def get_goal(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    goal = db.query(Goal).filter(
        Goal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(
            status_code=404,
            detail="Goals have not been calculated yet"
        )

    return goal