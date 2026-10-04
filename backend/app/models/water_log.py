from sqlalchemy import Column, Integer, Float, Date, ForeignKey
from app.database import Base


class WaterLog(Base):
    __tablename__ = "water_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    amount = Column(Float, nullable=False)