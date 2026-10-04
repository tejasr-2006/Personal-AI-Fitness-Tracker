from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from app.database import Base


class SleepLog(Base):
    __tablename__ = "sleep_logs"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    date = Column(Date, nullable=False, index=True)

    duration_hours = Column(Float, nullable=False)

    sleep_quality = Column(String, nullable=True)

    bedtime = Column(String, nullable=True)

    wake_time = Column(String, nullable=True)

    notes = Column(String, nullable=True)