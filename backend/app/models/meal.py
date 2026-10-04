from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from app.database import Base


class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    date = Column(Date, nullable=False, index=True)

    meal_type = Column(String, nullable=False)

    food_name = Column(String, nullable=False)

    quantity = Column(Float, nullable=True)
    unit = Column(String, nullable=True)

    calories = Column(Float, nullable=True)
    protein = Column(Float, nullable=True)
    carbohydrates = Column(Float, nullable=True)
    fat = Column(Float, nullable=True)
    fiber = Column(Float, nullable=True)