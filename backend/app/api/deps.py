# backend/app/api/deps.py

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError 
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.core.config import settings
from app.db.database import SessionLocal, get_db 

# OAuth2 şeması. tokenUrl, token'ın alınacağı endpoint'i göstermeli.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

# Token'ı doğrulayıp mevcut öğrenciyi döndüren dependency
async def get_current_student(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> models.Student:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        token_data = schemas.TokenData(sub=user_id_str)

    except (JWTError, ValidationError):
        raise credentials_exception

    try:
        user_id = int(token_data.sub)
    except ValueError:
        raise credentials_exception

    # ID ile öğrenciyi bul
    student = crud.crud_student.get_student(db, student_id=user_id) # crud.get_student yerine
    if student is None:
        raise credentials_exception
    return student