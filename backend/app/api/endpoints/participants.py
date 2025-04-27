# backend/app/api/endpoints/participants.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app import crud, schemas
from app.db.database import get_db

router = APIRouter()

# Tüm dünyaları listeleme endpoint'i (karosel için)
@router.get("/worlds", response_model=List[schemas.Participant])
async def read_participants(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100 # İsterseniz varsayılan limiti düşürebilirsiniz
):
    participants = crud.crud_participant.get_participants(db, skip=skip, limit=limit)
    return participants

# En iyi 5 dünyayı listeleme endpoint'i (scoreboard için)
@router.get("/worlds/top5", response_model=List[schemas.Participant])
async def read_top_participants(
    db: Session = Depends(get_db)
):
    top_participants = crud.crud_participant.get_participants_top5(db)
    return top_participants

# Belirli bir dünyayı ID ile getirme (belki detay sayfası için?)
@router.get("/worlds/{participant_id}", response_model=schemas.Participant)
async def read_participant(
    participant_id: int,
    db: Session = Depends(get_db)
):
    db_participant = crud.crud_participant.get_participant(db, participant_id=participant_id)
    if db_participant is None:
        raise HTTPException(status_code=404, detail="Participant not found")
    return db_participant