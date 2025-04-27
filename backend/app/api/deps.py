# backend/app/api/deps.py

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import ValidationError # Pydantic model doğrulama hatası için
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.core.config import settings
from app.db.database import SessionLocal, get_db # get_db'yi import ediyoruz

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
        # Token'ı decode etmeye çalış
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        # Token payload'ından 'sub' (subject) alanını al (öğrenci numarasını oraya koymuştuk)
        student_number: str = payload.get("sub")
        if student_number is None:
            raise credentials_exception # 'sub' alanı yoksa hata ver
        # Token verisini Pydantic şeması ile doğrula (opsiyonel ama iyi pratik)
        token_data = schemas.TokenData(student_number=student_number)

    except JWTError: # Token decode edilemezse (geçersiz format, imza hatası vb.)
        raise credentials_exception
    except ValidationError: # Pydantic şeması doğrulanamazsa
        raise credentials_exception

    # Veritabanından öğrenciyi bul
    student = crud.crud_student.get_student_by_student_number(db, student_number=token_data.student_number)
    if student is None:
        raise credentials_exception # Token geçerli ama veritabanında öyle bir öğrenci yoksa

    # Öğrenci bulunduysa döndür
    return student

# İleride admin kullanıcısı gibi farklı roller olursa benzer bir dependency eklenebilir
# async def get_current_active_superuser(
#     current_user: models.User = Depends(get_current_user),
# ) -> models.User:
#     if not crud.user.is_superuser(current_user):
#         raise HTTPException(
#             status_code=400, detail="The user doesn't have enough privileges"
#         )
#     return current_user