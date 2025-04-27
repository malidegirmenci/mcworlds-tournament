# backend/app/db/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("DATABASE_URL ortam değişkeni bulunamadı!")

# SQLAlchemy motorunu oluştur
# connect_args sadece SQLite içindir, PostgreSQL için genellikle gerekmez
# engine = create_engine(
#     SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False} # Sadece SQLite için
# )
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Veritabanı oturumları (session) oluşturmak için bir fabrika
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Modellerimizin miras alacağı temel sınıf
Base = declarative_base()

# Dependency Injection için veritabanı session'ı sağlayan fonksiyon
# FastAPI endpointlerinde bu fonksiyonu kullanarak session alacağız
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()