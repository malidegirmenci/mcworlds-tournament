-- participants Tablosu
CREATE TABLE participants (
    id SERIAL PRIMARY KEY,                     -- Otomatik artan benzersiz ID
    serial_number VARCHAR(50) UNIQUE NOT NULL, -- 'MCWorldBK-01' gibi benzersiz seri no
    video_url TEXT NOT NULL,                   -- Bunny CDN video linki
    like_count INTEGER DEFAULT 0 NOT NULL,     -- Beğeni sayısı (güncel tutulacak)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- students Tablosu
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    student_number VARCHAR(100) UNIQUE NOT NULL, -- Öğrenci Numarası (Giriş için)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    -- Not: Öğrenci bilgilerini (isim vb.) burada tutmak yerine,
    -- sadece giriş ve oy takibi için gerekli minimum bilgiyi (numara) tutabiliriz.
    -- İleride gerekirse eklenebilir.
);

-- votes Tablosu
CREATE TABLE votes (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,               -- Oy veren öğrencinin ID'si
    participant_id INTEGER NOT NULL,           -- Oy verilen dünyanın ID'si
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Bir öğrencinin aynı dünyaya birden fazla oy vermesini engelleme
    CONSTRAINT unique_student_vote UNIQUE (student_id, participant_id),

    -- students tablosu ile ilişki (öğrenci silinirse oyları da silinebilir - CASCADE)
    FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,

    -- participants tablosu ile ilişki (dünya silinirse oyları da silinebilir - CASCADE)
    FOREIGN KEY (participant_id) REFERENCES participants (id) ON DELETE CASCADE
);

-- updated_at sütununu otomatik güncellemek için bir trigger (isteğe bağlı ama önerilir)
-- Bu trigger, participants ve students tablolarındaki satırlar güncellendiğinde
-- updated_at alanını otomatik olarak ayarlar.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_participants_updated_at BEFORE UPDATE
ON participants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE
ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();