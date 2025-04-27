# backend/app/api/endpoints/votes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import crud, models, schemas
from app.api import deps # Mevcut kullanıcıyı almak için dependency
from app.db.database import get_db

router = APIRouter()

# Oy verme/geri alma endpoint'i
# Başarılı işlem sonrası güncellenmiş Participant bilgisini döndürelim
@router.post("/votes", response_model=schemas.Participant)
async def cast_or_retract_vote(
    *, # Keyword-only argümanlar için
    db: Session = Depends(get_db),
    vote_in: schemas.VoteCreate, # Request body'den participant_id'yi alacak
    current_student: models.Student = Depends(deps.get_current_student) # Token'dan öğrenciyi al
):
    # 1. Oy verilmek istenen katılımcı var mı?
    participant = crud.crud_participant.get_participant(db, participant_id=vote_in.participant_id)
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Oy verilmek istenen katılımcı bulunamadı."
        )

    # 2. Öğrenci bu katılımcıya daha önce oy vermiş mi?
    existing_vote = crud.crud_vote.get_vote_by_student_and_participant(
        db, student_id=current_student.id, participant_id=vote_in.participant_id
    )

    if existing_vote:
        # --- Oy Geri Alma (Unlike) ---
        # Oyu sil
        deleted = crud.crud_vote.delete_vote_by_student_and_participant(
            db, student_id=current_student.id, participant_id=vote_in.participant_id
        )
        if not deleted:
            # Normalde buraya düşmemeli ama olursa diye loglama/hata düşünülebilir
            raise HTTPException(status_code=500, detail="Oy silinirken bir hata oluştu.")

        # Katılımcının beğeni sayısını azalt
        updated_participant = crud.crud_participant.update_participant_like_count(
            db, participant_id=vote_in.participant_id, increment=-1
        )
        if not updated_participant:
            # Katılımcı bulunamazsa (silinmiş olabilir?) veya güncelleme olmazsa
            raise HTTPException(status_code=500, detail="Beğeni sayısı güncellenirken bir hata oluştu.")

        return updated_participant

    else:
        # --- Yeni Oy Verme (Like) ---
        # Öğrencinin mevcut oy sayısını kontrol et
        current_votes = crud.crud_vote.get_votes_by_student(db, student_id=current_student.id)
        if len(current_votes) >= 2:
            # Oy limiti aşıldı
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Oy limiti aşıldı (en fazla 2 farklı dünyaya oy verebilirsiniz)."
            )

        # Yeni oyu oluştur
        new_vote = crud.crud_vote.create_vote(db, vote=vote_in, student_id=current_student.id)
        if not new_vote:
            raise HTTPException(status_code=500, detail="Oy oluşturulurken bir hata oluştu.")

        # Katılımcının beğeni sayısını artır
        updated_participant = crud.crud_participant.update_participant_like_count(
            db, participant_id=vote_in.participant_id, increment=1
        )
        if not updated_participant:
            raise HTTPException(status_code=500, detail="Beğeni sayısı güncellenirken bir hata oluştu.")

        return updated_participant


# Giriş yapmış öğrencinin oylarını getirme endpoint'i
@router.get("/votes/my-votes", response_model=List[schemas.VoteOutSimple])
async def read_my_votes(
    db: Session = Depends(get_db),
    current_student: models.Student = Depends(deps.get_current_student)
):
    # Mevcut öğrencinin tüm oylarını (Vote nesneleri olarak) al
    db_votes = crud.crud_vote.get_votes_by_student(db, student_id=current_student.id)

    # Sonucu VoteOutSimple şemasına uygun hale getir (sadece participant_id listesi)
    my_votes_simple = [schemas.VoteOutSimple(participant_id=vote.participant_id) for vote in db_votes]

    return my_votes_simple