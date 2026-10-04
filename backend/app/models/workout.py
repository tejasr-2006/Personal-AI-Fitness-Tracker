from sqlalchemy import Column, Integer, String, Date, ForeignKey

from app.database import Base


class Workout(Base):
    __tablename__ = "workouts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    date = Column(Date, nullable=False, index=True)
    duration_minutes = Column(Integer, nullable=True)
    notes = Column(String, nullable=True)