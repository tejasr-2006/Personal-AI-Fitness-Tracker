from sqlalchemy import Column, Integer, String, Date, ForeignKey
from app.database import Base


class ProgressPhoto(Base):
    __tablename__ = "progress_photos"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    date = Column(Date, nullable=False, index=True)

    photo_url = Column(String, nullable=False)

    photo_type = Column(String, nullable=True)

    notes = Column(String, nullable=True)