# backend/app/api/endpoints/login.py

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm 
from sqlalchemy.orm import Session
from datetime import timedelta 

from app import crud, schemas, models 
from app.api import deps
from app.core.security import create_access_token, verify_password
from app.core.config import settings 
from app.db.database import get_db

router = APIRouter()

# Login endpoint'i
@router.post("/auth/login", response_model=schemas.Token)
async def login_for_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    student = crud.crud_student.get_student_by_email(db, email=form_data.username) 
    if not student or not verify_password(form_data.password, student.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz email veya şifre",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(student.id)}, expires_delta=access_token_expires 
    )

    return {"access_token": access_token, "token_type": "bearer"}

# Mevcut kullanıcının bilgisini alma endpoint'i (Token gerektirir)
@router.get("/auth/me", response_model=schemas.Student)
async def read_users_me(
    current_student: models.Student = Depends(deps.get_current_student)
):
    return current_student