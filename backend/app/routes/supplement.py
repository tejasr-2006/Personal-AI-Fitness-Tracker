from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.supplement import Supplement
from app.schemas.supplement import (
    SupplementCreate,
    SupplementResponse
)
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/supplements",
    tags=["Supplements"]
)


@router.post("", response_model=SupplementResponse)
def create_supplement(
    data: SupplementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    supplement = Supplement(
        user_id=current_user.id,
        **data.model_dump()
    )

    db.add(supplement)
    db.commit()
    db.refresh(supplement)

    return supplement


@router.get("", response_model=list[SupplementResponse])
def get_supplements(
    supplement_date: date | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Supplement).filter(
        Supplement.user_id == current_user.id
    )

    if supplement_date:
        query = query.filter(
            Supplement.date == supplement_date
        )

    return query.order_by(Supplement.id.desc()).all()


@router.patch("/{supplement_id}/taken")
def mark_supplement_taken(
    supplement_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    supplement = db.query(Supplement).filter(
        Supplement.id == supplement_id,
        Supplement.user_id == current_user.id
    ).first()

    if not supplement:
        raise HTTPException(
            status_code=404,
            detail="Supplement not found"
        )

    supplement.taken = True

    db.commit()
    db.refresh(supplement)

    return supplement