# backend/app/models/vote.py

from sqlalchemy import Column, Integer, DateTime, func, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship

from app.db.database import Base

class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    participant_id = Column(Integer, ForeignKey("participants.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="votes")
    participant = relationship("Participant", back_populates="votes")

    __table_args__ = (UniqueConstraint('student_id', 'participant_id', name='unique_student_vote'),)