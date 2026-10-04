from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.sleep_log import SleepLog
from app.models.user import User
from app.schemas.sleep import SleepCreate, SleepResponse
from app.utils.auth import get_current_user


router = APIRouter(prefix="/sleep", tags=["Sleep"])


@router.post("", response_model=SleepResponse)
def create_sleep(
    data: SleepCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sleep = SleepLog(
        user_id=current_user.id,
        **data.model_dump()
    )

    db.add(sleep)
    db.commit()
    db.refresh(sleep)

    return sleep


@router.get("", response_model=list[SleepResponse])
def get_sleep_logs(
    sleep_date: date | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(SleepLog).filter(
        SleepLog.user_id == current_user.id
    )

    if sleep_date:
        query = query.filter(SleepLog.date == sleep_date)

    return query.order_by(SleepLog.date.desc()).all()


@router.get("/daily")
def get_daily_sleep(
    sleep_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sleep = (
        db.query(SleepLog)
        .filter(
            SleepLog.user_id == current_user.id,
            SleepLog.date == sleep_date
        )
        .order_by(SleepLog.id.desc())
        .first()
    )

    if not sleep:
        return {
            "date": sleep_date,
            "duration_hours": 0,
            "sleep_quality": None,
            "bedtime": None,
            "wake_time": None
        }

    return {
        "date": sleep.date,
        "duration_hours": sleep.duration_hours,
        "sleep_quality": sleep.sleep_quality,
        "bedtime": sleep.bedtime,
        "wake_time": sleep.wake_time
    }