# backend/scripts/import_participants.py

import os
import sys
import pandas as pd
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import argparse

# Proje kök dizinini path'e ekle
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, PROJECT_ROOT)

# App modüllerini import et
try:
    from app.db.database import SessionLocal
    # Bu sefer Participant modelini import ediyoruz
    from app.models.participant import Participant
except ImportError as e:
    print(f"Hata: Gerekli modüller import edilemedi. Script'i 'backend' klasöründen çalıştırdığınızdan emin olun.")
    print(f"Detay: {e}")
    sys.exit(1)

# .env yükle
load_dotenv()
print("Participant import script başlatıldı...")

# DB Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Ana import fonksiyonu
def import_participants_from_excel(file_path: str, sheet_name: str = 'Sheet1',
                                   serial_col: str = 'Serial No', # Varsayılan sütun adı
                                   url_col: str = 'URL'):          # Varsayılan sütun adı
    print(f"Excel dosyası okunuyor: {file_path}, Sayfa: {sheet_name}")
    try:
        df = pd.read_excel(file_path, sheet_name=sheet_name)
        print(f"Dosya okundu. Toplam satır: {len(df)}")
    except FileNotFoundError:
        print(f"Hata: Belirtilen '{file_path}' dosyası bulunamadı.")
        return
    except Exception as e:
        print(f"Hata: Excel dosyası okunurken bir sorun oluştu: {e}")
        return

    db_gen = get_db()
    db: Session = next(db_gen)
    print("Veritabanı bağlantısı kuruldu.")

    added_count = 0
    skipped_count = 0

    # Gerekli sütunları kontrol et
    required_cols = {serial_col, url_col}
    if not required_cols.issubset(df.columns):
        print(f"Hata: Excel dosyasında gerekli sütunlar bulunamadı. Beklenenler: {required_cols}")
        print(f"Dosyadaki sütunlar: {list(df.columns)}")
        db.close()
        return

    try:
        for index, row in df.iterrows():
            print(f"\nSatır {index + 1} işleniyor...")
            try:
                # Verileri al
                serial_number = str(row[serial_col]).strip()
                video_url = str(row[url_col]).strip()

                # Gerekli alanlar boş mu kontrol et
                if not serial_number or not video_url:
                    print(f"Uyarı: Satır {index + 1} atlanıyor (Serial No veya URL boş). Serial No: '{serial_number}', URL: '{video_url}'")
                    skipped_count += 1
                    continue

                # Bu serial_number ile kayıt var mı kontrol et (serial_number UNIQUE olmalı)
                existing_participant = db.query(Participant).filter(Participant.serial_number == serial_number).first()

                if existing_participant:
                    print(f"Varolan Katılımcı: {serial_number} zaten kayıtlı, atlanıyor.")
                    skipped_count += 1
                else:
                    # Yeni katılımcı oluştur (like_count varsayılan 0 olacak)
                    new_participant = Participant(
                        serial_number=serial_number,
                        video_url=video_url
                    )
                    db.add(new_participant)
                    print(f"Yeni Katılımcı Eklendi: {serial_number}")
                    added_count += 1

            except KeyError as e:
                print(f"Hata: Satır {index + 1} işlenirken sütun bulunamadı: {e}. Sütun adlarını kontrol edin.")
                skipped_count += 1
            except Exception as e:
                print(f"Hata: Satır {index + 1} işlenirken beklenmedik bir hata oluştu: {e}")
                skipped_count += 1

        print("\nDeğişiklikler veritabanına işleniyor...")
        db.commit()
        print("Değişiklikler başarıyla işlendi.")

    except Exception as e:
        print(f"\nVeritabanı işlemi sırasında kritik hata: {e}")
        print("Değişiklikler geri alınıyor (rollback)...")
        db.rollback()
    finally:
        print("\nVeritabanı bağlantısı kapatılıyor.")
        db.close()

    print("\n--- Import Özeti ---")
    print(f"Toplam İşlenen Satır: {len(df)}")
    print(f"Başarıyla Eklenen Katılımcı Sayısı: {added_count}")
    print(f"Atlanan (Varolan veya Hatalı) Satır Sayısı: {skipped_count}")
    print("--------------------\nİşlem Tamamlandı.")


# Komut satırı argümanları
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Excel dosyasından katılımcı bilgilerini PostgreSQL veritabanına aktarır.")
    parser.add_argument("excel_file", help="Katılımcı bilgilerini içeren Excel dosyasının yolu (.xlsx)")
    parser.add_argument("-s", "--sheet", default="Sheet1", help="Excel dosyasındaki sayfa adı (varsayılan: Sheet1)")
    parser.add_argument("--serialcol", default="Serial No", help="Seri Numarası sütununun adı (varsayılan: Serial No)")
    parser.add_argument("--urlcol", default="URL", help="Video URL sütununun adı (varsayılan: URL)")

    args = parser.parse_args()

    import_participants_from_excel(args.excel_file, sheet_name=args.sheet,
                                   serial_col=args.serialcol,
                                   url_col=args.urlcol)