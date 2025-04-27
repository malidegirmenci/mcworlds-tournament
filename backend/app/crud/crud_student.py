# backend/app/crud/crud_student.py

from sqlalchemy.orm import Session
from app import models, schemas
# Şifreleme için (eğer şifre eklerseniz)
# from app.core.security import get_password_hash

# Belirli bir ID'ye sahip öğrenciyi getir
def get_student(db: Session, student_id: int):
    return db.query(models.Student).filter(models.Student.id == student_id).first()

# Belirli bir öğrenci numarasına sahip öğrenciyi getir (Login için önemli)
def get_student_by_student_number(db: Session, student_number: str):
    return db.query(models.Student).filter(models.Student.student_number == student_number).first()

# Tüm öğrencileri getir (sayfalama ile - admin için vb.)
def get_students(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Student).offset(skip).limit(limit).all()

# Yeni bir öğrenci oluştur (Öğrenciler önceden yüklenmeyecekse kullanılır)
def create_student(db: Session, student: schemas.StudentCreate):
    # Eğer ileride şifre eklenecek olursa:
    # hashed_password = get_password_hash(student.password)
    # db_student = models.Student(student_number=student.student_number, hashed_password=hashed_password)
    db_student = models.Student(student_number=student.student_number)
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student