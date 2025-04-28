# backend/scripts/import_students.py

import os
import sys
import pandas as pd
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import argparse

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
sys.path.insert(0, PROJECT_ROOT)

try:
    from app.db.database import SessionLocal
    from app.models.student import Student # Modelin güncellendiğinden emin olun
    from app.core.security import get_password_hash
except ImportError as e:
    print(f"Hata: Gerekli modüller import edilemedi. Script'i 'backend' klasöründen çalıştırdığınızdan emin olun.")
    print(f"Detay: {e}")
    sys.exit(1)

# .env yükle
load_dotenv()
print("Script başlatıldı...")

# DB Session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def import_students_from_excel(file_path: str, sheet_name: str = 'Sheet1',
                               fullname_col: str = 'Ad Soyad', # Varsayılan sütun adı
                               email_col: str = 'Email',
                               password_col: str = 'Şifre'):
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

    required_cols = {fullname_col, email_col, password_col}
    if not required_cols.issubset(df.columns):
        print(f"Hata: Excel dosyasında gerekli sütunlar bulunamadı. Beklenenler: {required_cols}")
        print(f"Dosyadaki sütunlar: {list(df.columns)}")
        db.close()
        return

    try:
        for index, row in df.iterrows():
            print(f"\nSatır {index + 1} işleniyor...")
            try:
                full_name = str(row[fullname_col]).strip() if pd.notna(row[fullname_col]) else None
                email = str(row[email_col]).strip().lower()
                password = str(row[password_col]).strip()

                if not email or not password:
                    print(f"Uyarı: Satır {index + 1} atlanıyor (Email veya Şifre boş). Email: '{email}', Şifre: '***'")
                    skipped_count += 1
                    continue

                existing_student = db.query(Student).filter(Student.email == email).first()

                if existing_student:
                    print(f"Varolan Öğrenci: {email} zaten kayıtlı, atlanıyor.")
                    skipped_count += 1
                else:
                    hashed_password = get_password_hash(password)
                    new_student = Student(
                        email=email,
                        hashed_password=hashed_password,
                        full_name=full_name # Tek isim alanını ata
                    )
                    db.add(new_student)
                    print(f"Yeni Öğrenci Eklendi: {email} - İsim: {full_name}")
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
    print(f"Başarıyla Eklenen Öğrenci Sayısı: {added_count}")
    print(f"Atlanan (Varolan veya Hatalı) Satır Sayısı: {skipped_count}")
    print("--------------------\nİşlem Tamamlandı.")


# Komut satırı argümanları (tek isim sütunu ile)
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Excel dosyasından öğrenci bilgilerini PostgreSQL veritabanına aktarır.")
    parser.add_argument("excel_file", help="Öğrenci bilgilerini içeren Excel dosyasının yolu (.xlsx)")
    parser.add_argument("-s", "--sheet", default="Sheet1", help="Excel dosyasındaki sayfa adı (varsayılan: Sheet1)")
    # Ad/Soyad için tek parametre
    parser.add_argument("--fullnamecol", default="Ad Soyad", help="Tam İsim (Ad Soyad) sütununun adı (varsayılan: Ad Soyad)")
    parser.add_argument("--emailcol", default="Email", help="Email sütununun adı (varsayılan: Email)")
    parser.add_argument("--passcol", default="Şifre", help="Şifre sütununun adı (varsayılan: Şifre)")

    args = parser.parse_args()

    import_students_from_excel(args.excel_file, sheet_name=args.sheet,
                               fullname_col=args.fullnamecol, # Güncellendi
                               email_col=args.emailcol,
                               password_col=args.passcol)