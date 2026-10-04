from sqlalchemy import Column, Integer, Float, Date, ForeignKey
from app.database import Base


class BodyMeasurement(Base):
    __tablename__ = "body_measurements"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    date = Column(Date, nullable=False, index=True)

    waist = Column(Float, nullable=True)
    chest = Column(Float, nullable=True)
    hips = Column(Float, nullable=True)
    neck = Column(Float, nullable=True)
    left_arm = Column(Float, nullable=True)
    right_arm = Column(Float, nullable=True)
    left_thigh = Column(Float, nullable=True)
    right_thigh = Column(Float, nullable=True)