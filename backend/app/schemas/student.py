# backend/app/schemas/student.py

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional


# Temel Student alanları
class StudentBase(BaseModel):
    email: EmailStr

class StudentCreate(StudentBase):
    password: str

class Student(StudentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    # votes: List[Vote] = [] # Öğrencinin oylarını da göstermek istersek eklenebilir

    class Config:
        from_attributes = True