from sqlalchemy import Column, Integer, String, Float, Date, Boolean, ForeignKey
from app.database import Base


class Supplement(Base):
    __tablename__ = "supplements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    dosage = Column(Float, nullable=True)
    unit = Column(String, nullable=True)
    date = Column(Date, nullable=False, index=True)
    taken = Column(Boolean, default=False)