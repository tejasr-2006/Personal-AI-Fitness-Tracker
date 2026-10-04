from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.nutrition_service import calculate_daily_totals
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/nutrition",
    tags=["Nutrition"]
)


@router.get("/daily")
def get_daily_nutrition(
    nutrition_date: date,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return calculate_daily_totals(
        db=db,
        user_id=current_user.id,
        meal_date=nutrition_date
    )