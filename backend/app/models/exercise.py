from sqlalchemy import Column, Integer, String, Float

from app.database import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    muscle_group = Column(String, nullable=True)
    equipment = Column(String, nullable=True)
    difficulty = Column(String, nullable=True)
    instructions = Column(String, nullable=True)
    calories_per_minute = Column(Float, nullable=True)