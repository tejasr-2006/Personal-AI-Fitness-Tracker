from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.weight_log import WeightLog
from app.schemas.weight import WeightCreate, WeightResponse
from app.utils.auth import get_current_user


router = APIRouter(prefix="/weight", tags=["Weight"])


@router.post("", response_model=WeightResponse)
def create_weight_log(
    data: WeightCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(WeightLog).filter(
        WeightLog.user_id == current_user.id,
        WeightLog.date == data.date
    ).first()

    if existing:
        existing.weight = data.weight
        db.commit()
        db.refresh(existing)
        return existing

    weight_log = WeightLog(
        user_id=current_user.id,
        date=data.date,
        weight=data.weight
    )

    db.add(weight_log)
    db.commit()
    db.refresh(weight_log)

    return weight_log


@router.get("", response_model=list[WeightResponse])
def get_weight_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(WeightLog).filter(
        WeightLog.user_id == current_user.id
    ).order_by(WeightLog.date.asc()).all()