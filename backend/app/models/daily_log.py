from sqlalchemy import Column, Integer, Float, String, Boolean, Date, ForeignKey
from app.database import Base


class DailyLog(Base):
    __tablename__ = "daily_logs"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    date = Column(Date, nullable=False, index=True)

    weight = Column(Float, nullable=True)

    calories_consumed = Column(Float, nullable=True)
    calories_burned = Column(Float, nullable=True)

    protein = Column(Float, nullable=True)
    carbohydrates = Column(Float, nullable=True)
    fat = Column(Float, nullable=True)
    fiber = Column(Float, nullable=True)

    water = Column(Float, nullable=True)

    steps = Column(Integer, nullable=True)

    workout_completed = Column(Boolean, default=False)

    sleep_duration = Column(Float, nullable=True)
    sleep_quality = Column(String, nullable=True)

    supplements_completed = Column(Integer, default=0)
    supplements_total = Column(Integer, default=0)

    mood = Column(String, nullable=True)
    energy = Column(Integer, nullable=True)

    notes = Column(String, nullable=True)