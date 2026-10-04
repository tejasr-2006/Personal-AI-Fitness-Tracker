from sqlalchemy import Column, Integer, Float, ForeignKey

from app.database import Base


class ExerciseLog(Base):
    __tablename__ = "exercise_logs"

    id = Column(Integer, primary_key=True, index=True)

    workout_id = Column(
        Integer,
        ForeignKey("workouts.id"),
        nullable=False,
        index=True
    )

    exercise_id = Column(
        Integer,
        ForeignKey("exercises.id"),
        nullable=False,
        index=True
    )

    sets = Column(Integer, nullable=True)
    reps = Column(Integer, nullable=True)
    weight = Column(Float, nullable=True)
    duration_minutes = Column(Integer, nullable=True)