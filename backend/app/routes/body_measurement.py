from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.body_measurement import BodyMeasurement
from app.models.user import User
from app.schemas.body_measurement import (
    BodyMeasurementCreate,
    BodyMeasurementResponse
)
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/measurements",
    tags=["Body Measurements"]
)


@router.post(
    "",
    response_model=BodyMeasurementResponse
)
def create_measurement(
    data: BodyMeasurementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    measurement = BodyMeasurement(
        user_id=current_user.id,
        **data.model_dump()
    )

    db.add(measurement)
    db.commit()
    db.refresh(measurement)

    return measurement


@router.get(
    "",
    response_model=list[BodyMeasurementResponse]
)
def get_measurements(
    measurement_date: date | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(BodyMeasurement).filter(
        BodyMeasurement.user_id == current_user.id
    )

    if measurement_date:
        query = query.filter(
            BodyMeasurement.date == measurement_date
        )

    return query.order_by(
        BodyMeasurement.date.desc()
    ).all()


@router.get("/latest")
def get_latest_measurement(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    measurement = (
        db.query(BodyMeasurement)
        .filter(
            BodyMeasurement.user_id == current_user.id
        )
        .order_by(BodyMeasurement.date.desc())
        .first()
    )

    if not measurement:
        return {
            "message": "No body measurements recorded yet"
        }

    return measurement