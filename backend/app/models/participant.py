# backend/app/models/participant.py

from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship

from app.db.database import Base

class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, index=True)
    serial_number = Column(String(50), unique=True, nullable=False, index=True)
    video_url = Column(String, nullable=False) 
    like_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    votes = relationship("Vote", back_populates="participant", cascade="all, delete-orphan")