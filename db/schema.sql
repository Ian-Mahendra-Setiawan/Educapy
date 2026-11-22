-- EduCapy - skema PostgreSQL (WP 1.2.1). Aman dijalankan berulang.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          VARCHAR(10)  NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subjects (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE
);

-- Mata pelajaran + jenjang yang bersedia diajarkan guru (WP 3.1.2)
CREATE TABLE IF NOT EXISTS teacher_subjects (
  teacher_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  level      VARCHAR(3) NOT NULL CHECK (level IN ('SD', 'SMP', 'SMA')),
  PRIMARY KEY (teacher_id, subject_id, level)
);

-- Slot ketersediaan mengajar guru: Senin-Jumat, 08:00-20:00, blok 1 jam (WP 3.1.1)
CREATE TABLE IF NOT EXISTS availability (
  id          SERIAL PRIMARY KEY,
  teacher_id  INT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 5), -- 1 = Senin
  start_time  TIME     NOT NULL,
  end_time    TIME     NOT NULL,
  CHECK (start_time >= TIME '08:00' AND end_time <= TIME '20:00' AND start_time < end_time),
  UNIQUE (teacher_id, day_of_week, start_time)
);

-- Les yang didaftarkan siswa pada slot guru di tanggal tertentu (WP 3.2.1)
CREATE TABLE IF NOT EXISTS lessons (
  id              SERIAL PRIMARY KEY,
  student_id      INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  teacher_id      INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  availability_id INT         NOT NULL REFERENCES availability(id) ON DELETE CASCADE,
  subject_id      INT         NOT NULL REFERENCES subjects(id),
  level           VARCHAR(3)  NOT NULL CHECK (level IN ('SD', 'SMP', 'SMA')),
  lesson_date     DATE        NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'scheduled'
                  CHECK (status IN ('scheduled', 'cancelled', 'teacher_withdrawn')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Satu slot pada satu tanggal hanya boleh dipakai satu les aktif
CREATE UNIQUE INDEX IF NOT EXISTS uq_lessons_active_slot
  ON lessons (availability_id, lesson_date) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_lessons_date ON lessons (lesson_date);
CREATE INDEX IF NOT EXISTS idx_lessons_student ON lessons (student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher ON lessons (teacher_id);

INSERT INTO subjects (name) VALUES
  ('Matematika'), ('IPA'), ('IPS'), ('Bahasa Indonesia'),
  ('Bahasa Inggris'), ('Fisika'), ('Kimia'), ('Biologi')
ON CONFLICT (name) DO NOTHING;
