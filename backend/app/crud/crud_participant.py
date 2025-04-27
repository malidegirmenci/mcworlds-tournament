# backend/app/crud/crud_participant.py

from sqlalchemy.orm import Session
from sqlalchemy import desc 

from app import models, schemas 

# Belirli bir ID'ye sahip participant'ı getir
def get_participant(db: Session, participant_id: int):
    return db.query(models.Participant).filter(models.Participant.id == participant_id).first()

# Belirli bir seri numarasına sahip participant'ı getir
def get_participant_by_serial_number(db: Session, serial_number: str):
    return db.query(models.Participant).filter(models.Participant.serial_number == serial_number).first()

# Tüm participant'ları getir (sayfalama ile)
def get_participants(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Participant).offset(skip).limit(limit).all()

# En çok beğeni alan ilk 5 participant'ı getir (Scoreboard için)
def get_participants_top5(db: Session):
    return db.query(models.Participant).order_by(desc(models.Participant.like_count)).limit(5).all()

# Yeni bir participant oluştur (Admin paneli vb. için gerekebilir)
def create_participant(db: Session, participant: schemas.ParticipantCreate):
    db_participant = models.Participant(
        serial_number=participant.serial_number,
        video_url=participant.video_url,
        like_count=0 # Başlangıçta 0 like
    )
    db.add(db_participant)
    db.commit()
    db.refresh(db_participant) # ID gibi DB tarafından atanan değerleri almak için
    return db_participant

# Participant'ın beğeni sayısını güncelle (artırma/azaltma)
def update_participant_like_count(db: Session, participant_id: int, increment: int = 1):
    db_participant = get_participant(db, participant_id=participant_id)
    if db_participant:
        # Negatif olmasını engelle (isteğe bağlı)
        if db_participant.like_count + increment >= 0:
            db_participant.like_count += increment
            db.commit()
            db.refresh(db_participant)
            return db_participant
    return None # Katılımcı bulunamazsa veya güncelleme olmazsa None dön

# Participant silme (Gerekirse eklenebilir)
# def delete_participant(db: Session, participant_id: int):
#     db_participant = get_participant(db, participant_id=participant_id)
#     if db_participant:
#         db.delete(db_participant)
#         db.commit()
#         return True
#     return False