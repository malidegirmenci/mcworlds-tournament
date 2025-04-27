# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.endpoints import login, participants, votes
from app.core.config import settings 

# FastAPI uygulamasını oluştur
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json" # Swagger dokümantasyon adresi
)

# CORS (Cross-Origin Resource Sharing) Ayarları
# Frontend'in (örn: localhost:3000) backend'e (örn: localhost:8000)
# istek yapabilmesi için izin vermemiz gerekiyor.
# Geliştirme ortamı için genellikle daha esnek ayarlar kullanılır.
# Production'da origins listesini kısıtlamalısınız!
origins = [
    "http://localhost",         # Frontend local'de çalışıyorsa
    "http://localhost:3000",    # React default portu
    "http://localhost:3001",    # Başka bir olası port
    # Gerekirse buraya deploy edilen frontend adresini ekleyin
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS if settings.BACKEND_CORS_ORIGINS else origins, # Ayarlardan al veya varsayılanı kullan
    allow_credentials=True,
    allow_methods=["*"], # İzin verilen HTTP metodları (GET, POST, vb.)
    allow_headers=["*"], # İzin verilen HTTP başlıkları
)

# API Router'larını uygulamaya dahil et
# prefix: Bu router'daki tüm endpoint'lerin başına eklenecek yol
# tags: Swagger dokümantasyonunda gruplama için kullanılır
app.include_router(login.router, prefix=settings.API_V1_STR, tags=["Login"])
app.include_router(participants.router, prefix=settings.API_V1_STR, tags=["Participants"])
app.include_router(votes.router, prefix=settings.API_V1_STR, tags=["Votes"])


# Kök dizin için basit bir endpoint (sunucunun çalıştığını test etmek için)
@app.get("/")
async def root():
    return {"message": "Welcome to MC Worlds Tournament API!"}