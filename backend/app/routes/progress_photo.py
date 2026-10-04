from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.progress_photo import ProgressPhoto
from app.models.user import User
from app.schemas.progress_photo import (
    ProgressPhotoCreate,
    ProgressPhotoResponse
)
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/progress-photos",
    tags=["Progress Photos"]
)


@router.post(
    "",
    response_model=ProgressPhotoResponse
)
def create_progress_photo(
    data: ProgressPhotoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    photo = ProgressPhoto(
        user_id=current_user.id,
        **data.model_dump()
    )

    db.add(photo)
    db.commit()
    db.refresh(photo)

    return photo


@router.get(
    "",
    response_model=list[ProgressPhotoResponse]
)
def get_progress_photos(
    photo_date: date | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(ProgressPhoto).filter(
        ProgressPhoto.user_id == current_user.id
    )

    if photo_date:
        query = query.filter(
            ProgressPhoto.date == photo_date
        )

    return query.order_by(
        ProgressPhoto.date.desc()
    ).all()


@router.delete("/{photo_id}")
def delete_progress_photo(
    photo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    photo = (
        db.query(ProgressPhoto)
        .filter(
            ProgressPhoto.id == photo_id,
            ProgressPhoto.user_id == current_user.id
        )
        .first()
    )

    if not photo:
        return {"error": "Photo not found"}

    db.delete(photo)
    db.commit()

    return {"message": "Progress photo deleted"}