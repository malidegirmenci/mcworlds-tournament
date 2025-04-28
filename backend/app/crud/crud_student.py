# backend/app/crud/crud_student.py

from sqlalchemy.orm import Session
from app import models, schemas
from app.core.security import get_password_hash

# Belirli bir ID'ye sahip öğrenciyi getir
def get_student(db: Session, student_id: int):
    return db.query(models.Student).filter(models.Student.id == student_id).first()

# Belirli bir öğrenci numarasına sahip öğrenciyi getir (Login için önemli)
def get_student_by_email(db: Session, email: str):
    return db.query(models.Student).filter(models.Student.email == email).first()

# Tüm öğrencileri getir (sayfalama ile - admin için vb.)
def get_students(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Student).offset(skip).limit(limit).all()

# Yeni bir öğrenci oluştur
def create_student(db: Session, student: schemas.StudentCreate):
    hashed_password = get_password_hash(student.password) # Şifreyi hash'le
    db_student = models.Student(
        email=student.email,
        hashed_password=hashed_password # Hash'lenmiş şifreyi kaydet
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student