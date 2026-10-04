from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.meal import Meal
from app.models.user import User
from app.schemas.meal import MealCreate, MealResponse
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/meals",
    tags=["Meals"]
)


@router.post(
    "",
    response_model=MealResponse
)
def create_meal(
    data: MealCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meal = Meal(
        user_id=current_user.id,
        **data.model_dump()
    )

    db.add(meal)
    db.commit()
    db.refresh(meal)

    return meal


@router.get(
    "",
    response_model=list[MealResponse]
)
def get_meals(
    meal_date: date | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Meal).filter(
        Meal.user_id == current_user.id
    )

    if meal_date:
        query = query.filter(Meal.date == meal_date)

    return query.order_by(Meal.id.desc()).all()


@router.delete("/{meal_id}")
def delete_meal(
    meal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    meal = db.query(Meal).filter(
        Meal.id == meal_id,
        Meal.user_id == current_user.id
    ).first()

    if not meal:
        raise HTTPException(
            status_code=404,
            detail="Meal not found"
        )

    db.delete(meal)
    db.commit()

    return {"message": "Meal deleted successfully"}