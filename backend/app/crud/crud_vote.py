# backend/app/crud/crud_vote.py

from sqlalchemy.orm import Session
from app import models, schemas

# Belirli bir öğrencinin tüm oylarını getir
def get_votes_by_student(db: Session, student_id: int):
    return db.query(models.Vote).filter(models.Vote.student_id == student_id).all()

# Belirli bir öğrencinin belirli bir katılımcıya oy verip vermediğini kontrol et/getir
def get_vote_by_student_and_participant(db: Session, student_id: int, participant_id: int):
    return db.query(models.Vote).filter(
        models.Vote.student_id == student_id,
        models.Vote.participant_id == participant_id
    ).first()

# Yeni bir oy oluştur
def create_vote(db: Session, vote: schemas.VoteCreate, student_id: int):
    db_vote = models.Vote(
        student_id=student_id,
        participant_id=vote.participant_id
    )
    db.add(db_vote)
    db.commit()
    db.refresh(db_vote)
    return db_vote

# Bir oyu sil (ID ile - daha az kullanılır)
# def delete_vote(db: Session, vote_id: int):
#     db_vote = db.query(models.Vote).filter(models.Vote.id == vote_id).first()
#     if db_vote:
#         db.delete(db_vote)
#         db.commit()
#         return True
#     return False

# Belirli bir öğrencinin belirli bir katılımcıya verdiği oyu sil (Unlike için önemli)
def delete_vote_by_student_and_participant(db: Session, student_id: int, participant_id: int):
    db_vote = get_vote_by_student_and_participant(db, student_id=student_id, participant_id=participant_id)
    if db_vote:
        db.delete(db_vote)
        db.commit()
        return True # Silme başarılı
    return False # Silinecek oy bulunamadı