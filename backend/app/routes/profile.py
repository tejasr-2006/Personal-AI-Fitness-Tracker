from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.profile import Profile
from app.models.user import User
from app.schemas.profile import ProfileCreate, ProfileResponse
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)


@router.post(
    "",
    response_model=ProfileResponse
)
def create_profile(
    data: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing_profile = db.query(Profile).filter(
        Profile.user_id == current_user.id
    ).first()

    if existing_profile:
        raise HTTPException(
            status_code=400,
            detail="Profile already exists"
        )

    profile = Profile(
        user_id=current_user.id,
        **data.model_dump()
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


@router.get(
    "",
    response_model=ProfileResponse
)
def get_profile(
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

    return profile

@router.put(
    "",
    response_model=ProfileResponse
)
def upsert_profile(
    data: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(
        Profile.user_id == current_user.id
    ).first()

    if profile:
        for key, value in data.model_dump().items():
            setattr(profile, key, value)
    else:
        profile = Profile(user_id=current_user.id, **data.model_dump())
        db.add(profile)

    db.commit()
    db.refresh(profile)

    return profile
