from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey

from app.database import Base


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    date = Column(Date, nullable=False, index=True)

    activity_type = Column(String, nullable=False)

    duration_minutes = Column(Integer, nullable=True)

    calories_burned = Column(Float, nullable=True)

    steps = Column(Integer, nullable=True)

    notes = Column(String, nullable=True)