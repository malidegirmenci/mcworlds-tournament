# backend/app/schemas/participant.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional 


class ParticipantBase(BaseModel):
    serial_number: str
    video_url: str

class ParticipantCreate(ParticipantBase):
    pass 

class Participant(ParticipantBase):
    id: int
    like_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True