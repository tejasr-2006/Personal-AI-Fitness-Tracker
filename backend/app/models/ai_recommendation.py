from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey
from app.database import Base


class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    date = Column(Date, nullable=False, index=True)

    category = Column(String, nullable=False)

    recommendation = Column(Text, nullable=False)

    priority = Column(String, nullable=True)

    status = Column(String, default="active")