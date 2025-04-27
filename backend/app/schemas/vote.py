# backend/app/schemas/vote.py

from pydantic import BaseModel
from datetime import datetime

class VoteBase(BaseModel):
    participant_id: int

class VoteCreate(VoteBase):
    pass

class Vote(VoteBase):
    id: int
    student_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class VoteOutSimple(BaseModel):
    participant_id: int