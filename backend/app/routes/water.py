from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.water_log import WaterLog
from app.schemas.water import WaterCreate, WaterResponse
from app.utils.auth import get_current_user


router = APIRouter(prefix="/water", tags=["Water"])


@router.post("", response_model=WaterResponse)
def add_water(
    data: WaterCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    water_log = WaterLog(
        user_id=current_user.id,
        date=data.date,
        amount=data.amount
    )

    db.add(water_log)
    db.commit()
    db.refresh(water_log)

    return water_log


@router.get("/daily")
def get_daily_water(
    water_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logs = db.query(WaterLog).filter(
        WaterLog.user_id == current_user.id,
        WaterLog.date == water_date
    ).all()

    total = sum(log.amount for log in logs)

    return {
        "date": water_date,
        "total_water": total
    }


@router.get("", response_model=list[WaterResponse])
def get_water_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(WaterLog).filter(
        WaterLog.user_id == current_user.id
    ).order_by(WaterLog.date.asc()).all()