from datetime import date, datetime, timezone

from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.models.goal import Goal
from app.models.water_log import WaterLog
from app.services.nutrition_service import calculate_daily_totals


def generate_daily_notifications(
    db: Session,
    user_id: int
):
    today = date.today()

    notifications = []

    goal = (
        db.query(Goal)
        .filter(Goal.user_id == user_id)
        .first()
    )

    if not goal:
        return []

    nutrition = calculate_daily_totals(
        db=db,
        user_id=user_id,
        meal_date=today
    )

    # Protein alert
    if (
        goal.protein is not None
        and nutrition["protein_consumed"] < goal.protein * 0.5
    ):
        notifications.append(
            {
                "title": "Protein is low",
                "message": (
                    "Your protein intake is currently "
                    "below half of your daily target."
                ),
                "type": "nutrition"
            }
        )

    # Calorie alert
    if (
        goal.target_calories is not None
        and nutrition["calories_consumed"] < goal.target_calories * 0.5
    ):
        notifications.append(
            {
                "title": "Calories are low",
                "message": (
                    "You have consumed less than half "
                    "of your daily calorie target."
                ),
                "type": "nutrition"
            }
        )

    # Water alert
    water = (
        db.query(WaterLog)
        .filter(
            WaterLog.user_id == user_id,
            WaterLog.date == today
        )
        .all()
    )

    total_water = sum(
        item.amount or 0
        for item in water
    )

    if (
        goal.water is not None
        and total_water < goal.water * 0.5
    ):
        notifications.append(
            {
                "title": "Stay hydrated",
                "message": (
                    "Your water intake is currently "
                    "below half of your daily target."
                ),
                "type": "water"
            }
        )

    # Skip alerts that were already generated today (the button can be pressed repeatedly)
    # created_at is stored as naive UTC, so compare against the start of the UTC day
    day_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0, tzinfo=None)
    existing_today = {
        (n.title, n.notification_type)
        for n in db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.created_at >= day_start,
        )
    }
    notifications = [
        n for n in notifications if (n["title"], n["type"]) not in existing_today
    ]

    # Save notifications
    saved = []

    for item in notifications:
        notification = Notification(
            user_id=user_id,
            title=item["title"],
            message=item["message"],
            notification_type=item["type"]
        )

        db.add(notification)
        saved.append(notification)

    db.commit()

    return saved