from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.daily_log import DailyLog
from app.models.user import User
from app.schemas.daily_log import (
    DailyLogCreate,
    DailyLogResponse
)
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/daily-log",
    tags=["Daily Logs"]
)


@router.post(
    "",
    response_model=DailyLogResponse
)
def create_or_update_daily_log(
    data: DailyLogCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id,
        DailyLog.date == data.date
    ).first()

    if log:
        for key, value in data.model_dump().items():
            setattr(log, key, value)
    else:
        log = DailyLog(
            user_id=current_user.id,
            **data.model_dump()
        )
        db.add(log)

    db.commit()
    db.refresh(log)

    return log


@router.get(
    "/{log_date}",
    response_model=DailyLogResponse
)
def get_daily_log(
    log_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    log = db.query(DailyLog).filter(
        DailyLog.user_id == current_user.id,
        DailyLog.date == log_date
    ).first()

    if not log:
        raise HTTPException(
            status_code=404,
            detail="Daily log not found"
        )

    return log