from sqlalchemy import Column, Integer, Float, String, ForeignKey
from app.database import Base


class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    goal_type = Column(String, nullable=False)

    bmr = Column(Float, nullable=True)
    tdee = Column(Float, nullable=True)
    maintenance_calories = Column(Float, nullable=True)
    target_calories = Column(Float, nullable=True)

    protein = Column(Float, nullable=True)
    carbs = Column(Float, nullable=True)
    fat = Column(Float, nullable=True)

    water = Column(Float, nullable=True)