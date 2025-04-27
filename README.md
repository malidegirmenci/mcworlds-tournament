# MC Worlds Tournament - Minecraft Dünyaları Turnuvası Web Uygulaması

Bu proje, öğrencilerin Minecraft'ta oluşturdukları dünyaların videolarını sergileyebilecekleri, diğer kullanıcıların bu dünyaları oylayabileceği ve en popüler dünyaların listeleneceği bir web uygulamasıdır.

## ✨ Temel Özellikler

* **Video Karuseli:** Öğrenci dünyalarının videoları kaydırılabilir bir karusel (KeenSlider) içinde gösterilir.
* **Oylama Sistemi:** Kullanıcılar (öğrenci numarası ile giriş yaparak) beğendikleri dünyalara oy verebilir (kalp ikonu). Her kullanıcının 2 oy hakkı vardır ve oylar farklı dünyalara verilmelidir. Aynı dünyaya tekrar tıklayarak oy geri alınabilir.
* **Beğeni Sayacı:** Her dünyanın yanında toplam beğeni sayısı gösterilir.
* **Skor Tablosu (Top 5):** En çok beğeni alan ilk 5 dünya, ayrı bir açılır pencerede (modal) listelenir.
* **Kullanıcı Girişi:** Öğrenciler kendilerine atanan öğrenci numaraları ile sisteme giriş yapabilirler.
* **Özel Tema:** Minecraft temasına uygun özel font ve ikonlar kullanılmıştır.

## 🚀 Kullanılan Teknolojiler

**Backend:**

* **Programlama Dili:** Python 3.x
* **Web Framework:** FastAPI
* **Veritabanı:** PostgreSQL
* **ORM/Veritabanı Adaptörü:** SQLAlchemy, psycopg2-binary
* **Kimlik Doğrulama:** JWT (python-jose)
* **Diğer:** Uvicorn (ASGI Sunucu), Pydantic, python-dotenv

**Frontend:**

* **Kütüphane/Framework:** React (Vite ile oluşturuldu)
* **Dil:** TypeScript
* **Stil:** TailwindCSS
* **API İstemcisi:** Axios
* **Karusel:** KeenSlider
* **State Yönetimi:** React Context API

## 📁 Proje Yapısı
mcworlds-tournament/
├── backend/             # Python/FastAPI Backend Kodu
│   ├── app/             # Ana uygulama kodu (main, api, crud, models, schemas vb.)
│   ├── venv/            # Python sanal ortamı (gitignore ile hariç tutulur)
│   ├── requirements.txt # Python bağımlılıkları
│   ├── .env             # Ortam değişkenleri (gitignore ile hariç tutulur)
│   └── .gitignore       # Backend için Git ignore dosyası
│
├── frontend/            # React/Vite Frontend Kodu
│   ├── public/          # Statik dosyalar (resimler vb.)
│   ├── src/             # React kaynak kodu (components, context, services, types vb.)
│   ├── node_modules/    # Node.js bağımlılıkları (gitignore ile hariç tutulur)
│   ├── package.json     # Proje ve bağımlılık tanımları
│   ├── vite.config.ts   # Vite yapılandırması
│   ├── tailwind.config.js # Tailwind yapılandırması
│   ├── postcss.config.js # PostCSS yapılandırması
│   └── .gitignore       # Frontend için Git ignore dosyası (genellikle Vite otomatik oluşturur)
│
└── README.md            # Bu dosya (Proje ana dizininde)

## ⚙️ Kurulum ve Başlatma

### Ön Gereksinimler

* [Python](https://www.python.org/) (3.8 veya üstü önerilir) ve `pip`
* [Node.js](https://nodejs.org/) (LTS versiyonu önerilir) ve `npm` (veya `yarn`)
* [PostgreSQL](https://www.postgresql.org/) veritabanı sunucusu
* [Git](https://git-scm.com/)

### Backend Kurulumu

1.  **Repoyu Klonlama:**
    ```bash
    git clone <repo-adresi>
    cd mcworlds-tournament/backend
    ```
2.  **Sanal Ortam Oluşturma ve Aktive Etme:**
    ```bash
    python -m venv venv
    # Windows:
    venv\Scripts\activate
    # MacOS/Linux:
    source venv/bin/activate
    ```
3.  **Bağımlılıkları Yükleme:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Veritabanı Ayarları:**
    * PostgreSQL'de `mcworlds_db` adında (veya istediğiniz başka bir adla) bir veritabanı oluşturun.
    * Bu veritabanına erişim yetkisi olan bir kullanıcı oluşturun (veya mevcut bir kullanıcıyı kullanın).
    * Proje içinde sağlanan SQL komutlarını (veya migration araçlarını) kullanarak tabloları (`students`, `participants`, `votes`) oluşturun. (Daha önceki adımlarda verilen SQL komutları kullanılabilir).
5.  **Ortam Değişkenleri (`.env`):**
    * `backend` klasöründe `.env.example` adında bir dosya oluşturun (veya varsa kopyalayın):
        ```dotenv
        # backend/.env.example
        DATABASE_URL=postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DB_NAME>
        SECRET_KEY=<BURAYA_COK_GIZLI_BIR_ANAHTAR_URETIP_YAZIN>
        ALGORITHM=HS256
        ACCESS_TOKEN_EXPIRE_MINUTES=30
        PROJECT_NAME="MC Worlds Tournament Backend"
        API_V1_STR="/api/v1"
        BACKEND_CORS_ORIGINS='["http://localhost:5173", "[http://127.0.0.1:5173](http://127.0.0.1:5173)"]' # Frontend adres(ler)i JSON formatında
        ```
    * Bu dosyayı `.env` olarak kopyalayın: `cp .env.example .env` (Linux/Mac) veya `copy .env.example .env` (Windows).
    * `.env` dosyasını açıp kendi veritabanı bilgilerinizi (`<USER>`, `<PASSWORD>`, `<HOST>`, `<PORT>`, `<DB_NAME>`) ve `SECRET_KEY` için `openssl rand -hex 32` veya `python -c 'import secrets; print(secrets.token_hex(32))'` ile ürettiğiniz **güvenli bir anahtarı** girin. `BACKEND_CORS_ORIGINS` kısmının frontend adresinizi içerdiğinden emin olun.

### Frontend Kurulumu

1.  **Dizine Geçme:**
    ```bash
    cd ../frontend
    # veya ana dizinden: cd mcworlds-tournament/frontend
    ```
2.  **Bağımlılıkları Yükleme:**
    ```bash
    npm install
    # veya
    # yarn install
    ```
3.  **Ortam Değişkenleri (`.env` - Frontend):**
    * Frontend'in backend API adresini bilmesi için `frontend` klasöründe `.env.example` dosyası oluşturun:
        ```dotenv
        # frontend/.env.example
        VITE_API_BASE_URL=http://localhost:8000/api/v1
        ```
    * Bu dosyayı `.env` olarak kopyalayın: `cp .env.example .env` (Linux/Mac) veya `copy .env.example .env` (Windows).
    * Gerekirse `.env` dosyasındaki `VITE_API_BASE_URL` değerini backend adresinize göre güncelleyin.
    * **Önemli:** `frontend/src/services/api.ts` dosyasındaki `baseURL` tanımını ortam değişkeninden okuyacak şekilde güncelleyin:
        ```typescript
        // src/services/api.ts
        import axios from 'axios';

        const apiClient = axios.create({
          // Ortam değişkeninden oku (Vite için import.meta.env kullanılır)
          baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1', // Fallback
          headers: {
            'Content-Type': 'application/json',
          },
        });
        // ... (interceptor aynı kalır) ...
        export default apiClient;
        ```

### Uygulamayı Çalıştırma

1.  **Backend Sunucusunu Başlatma:**
    * `backend` klasöründe olduğunuzdan ve sanal ortamın aktif olduğundan emin olun.
    * Şu komutu çalıştırın:
        ```bash
        uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
        ```
    * Sunucu `http://localhost:8000` adresinde çalışmaya başlayacaktır. API dokümantasyonuna `http://localhost:8000/docs` adresinden erişebilirsiniz.

2.  **Frontend Geliştirme Sunucusunu Başlatma:**
    * Ayrı bir terminalde `frontend` klasöründe olduğunuzdan emin olun.
    * Şu komutu çalıştırın:
        ```bash
        npm run dev
        # veya
        # yarn dev
        ```
    * Sunucu genellikle `http://localhost:5173` adresinde çalışmaya başlayacaktır (terminal çıktısını kontrol edin).

3.  **Uygulamaya Erişme:**
    * Tarayıcınızda frontend adresini (örn: `http://localhost:5173`) açın.
    * Giriş ekranı ile karşılaşmalısınız. Veritabanına eklediğiniz bir öğrenci numarası ile giriş yapabilirsiniz.

## 🔧 Yapılandırma (.env Değişkenleri)

### Backend (`backend/.env`)

* `DATABASE_URL`: PostgreSQL bağlantı adresi.
* `SECRET_KEY`: JWT tokenları imzalamak için kullanılan gizli anahtar.
* `ALGORITHM`: JWT algoritması (varsayılan: HS256).
* `ACCESS_TOKEN_EXPIRE_MINUTES`: JWT token geçerlilik süresi (dakika).
* `PROJECT_NAME`: Proje adı (Swagger dokümantasyonunda kullanılır).
* `API_V1_STR`: API endpoint'lerinin başına eklenen prefix (örn: `/api/v1`).
* `BACKEND_CORS_ORIGINS`: İzin verilen frontend origin adresleri (JSON array formatında string, örn: `'["http://localhost:5173"]'`).

### Frontend (`frontend/.env`)

* `VITE_API_BASE_URL`: Backend API'sinin tam adresi (örn: `http://localhost:8000/api/v1`).

---
