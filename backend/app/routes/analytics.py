from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.analytics_service import get_progress_summary
from app.utils.auth import get_current_user


router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)


@router.get("/progress")
def progress_dashboard(
    days: int = Query(7, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_progress_summary(
        db=db,
        user_id=current_user.id,
        days=days
    )