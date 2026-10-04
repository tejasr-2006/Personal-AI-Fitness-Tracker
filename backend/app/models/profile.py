from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.database import Base


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)

    height = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)
    goal_weight = Column(Float, nullable=True)

    activity_level = Column(String, nullable=True)
    fitness_level = Column(String, nullable=True)
    goal = Column(String, nullable=True)

    dietary_preferences = Column(String, nullable=True)
    food_preferences = Column(String, nullable=True)
    food_dislikes = Column(String, nullable=True)
    allergies = Column(String, nullable=True)

    equipment = Column(String, nullable=True)
    workout_location = Column(String, nullable=True)
    budget = Column(Float, nullable=True)

    wake_time = Column(String, nullable=True)
    sleep_time = Column(String, nullable=True)