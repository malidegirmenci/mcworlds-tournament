# backend/app/api/endpoints/login.py

from fastapi import APIRouter, Depends, HTTPException, status, Form
#from fastapi.security import OAuth2PasswordBearer # Belki login için direkt form data alırız
from sqlalchemy.orm import Session
from typing import Any # Token response için

from app import crud, schemas, models
from app.api import deps # Bağımlılıkları (get_current_student vb.) import edeceğiz (birazdan oluşturulacak)
from app.core.security import create_access_token
from app.db.database import get_db # DB session almak için
from app.core.config import settings

from datetime import timedelta

router = APIRouter()

# Login endpoint'i
@router.post("/auth/login", response_model=schemas.Token)
async def login_for_access_token(
    db: Session = Depends(get_db),
    student_number: str = Form(...) # Frontend'den öğrenci numarasını form datası olarak alıyoruz
):
    # Öğrenci numarasını kullanarak öğrenciyi veritabanında bul
    student = crud.crud_student.get_student_by_student_number(db, student_number=student_number)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz öğrenci numarası",
            headers={"WWW-Authenticate": "Bearer"}, # Genellikle token bazlı auth için kullanılır
        )

    # Öğrenci bulunduysa, token oluştur
    # Token payload'ına öğrenci numarasını ekleyelim ki sonra kullanabilelim
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": student.student_number}, expires_delta=access_token_expires
    )

    # Token'ı döndür
    return {"access_token": access_token, "token_type": "bearer"}

# Mevcut kullanıcının bilgisini alma endpoint'i (Token gerektirir)
@router.get("/auth/me", response_model=schemas.Student)
async def read_users_me(
    current_student: models.Student = Depends(deps.get_current_student) # Token'dan öğrenciyi alan dependency
):
    # get_current_student dependency'si token'ı doğrular ve öğrenci objesini döndürür
    return current_student