# EduCapy

Aplikasi web manajemen penjadwalan les untuk Capybara Learning Center
(Software House: CreoSoft). Stack: Node.js 20, Express, PostgreSQL, frontend HTML/JS.

## Menjalankan di lokal

Prasyarat: Node.js 20+, PostgreSQL 14+, Git, browser Chrome/Firefox.

```bash
git clone <URL-REPO> educapy && cd educapy
npm install
cp .env.example .env            # lalu isi DATABASE_URL dan JWT_SECRET
npm run db:init                 # membuat tabel dan data mata pelajaran (setelah database siap, lihat di bawah)
npm run admin:create            # membuat akun admin dari ADMIN_* di .env
npm start                       # buka http://localhost:3000
npm test                        # unit test aturan bisnis
```

## Menyiapkan database (sekali)

`DATABASE_URL` di `.env` memakai user `educapy` dengan password `educapy` pada database `educapy`. User dan database itu **harus dibuat dulu**. Pilih salah satu cara:

**A. Lewat Git Bash** (password yang diminta adalah password user `postgres` saat Anda memasang PostgreSQL):

```bash
psql -U postgres -c "CREATE USER educapy WITH PASSWORD 'educapy';"
psql -U postgres -c "CREATE DATABASE educapy OWNER educapy;"
```

Jika `psql` tidak dikenali, tambahkan folder `bin` PostgreSQL (misalnya `C:\Program Files\PostgreSQL\16\bin`) ke PATH Windows, lalu buka ulang Git Bash.

**B. Lewat pgAdmin:** klik kanan Login/Group Roles, buat `educapy` dengan password `educapy` dan izin Can login. Klik kanan Databases, buat database `educapy` dengan Owner `educapy`.

**C. Memakai user `postgres`:** buat database `educapy` lewat pgAdmin, lalu ubah `.env` menjadi `DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/educapy`. Karakter khusus pada password harus di-URL-encode (contoh: `@` menjadi `%40`).

Setelah itu jalankan `npm run db:init`. Hasil yang benar: `Skema database siap.`

## Jika muncul "Database belum siap" atau "Kesalahan server"

Lihat tulisan di jendela terminal tempat `npm start` berjalan. Baris `[DATABASE]` atau `PERINGATAN` menjelaskan penyebabnya.

| Pesan di terminal | Penyebab | Solusi |
|---|---|---|
| `Tabel belum dibuat` (`relation "users" does not exist`) | `npm run db:init` belum dijalankan atau gagal | Jalankan `npm run db:init` |
| `Login database ditolak` (`password authentication failed`) | User atau password di `DATABASE_URL` salah, atau user `educapy` belum dibuat | Buat user (cara A atau B), atau samakan `.env` dengan user yang ada |
| `Database tidak ditemukan` (`database ... does not exist`) | Database `educapy` belum dibuat | Buat database (cara A atau B) |
| `PostgreSQL tidak berjalan` (`ECONNREFUSED`) | Layanan PostgreSQL mati, atau port salah | Nyalakan layanan PostgreSQL (Services Windows), cek port di `DATABASE_URL` (biasanya 5432) |

Setelah mengubah `.env`, hentikan server (Ctrl+C) lalu jalankan `npm start` lagi.

## Struktur

| Folder | Isi |
|---|---|
| `db/` | Skema PostgreSQL |
| `src/routes/` | Endpoint API (dimuat otomatis) |
| `src/security/`, `src/rules/` | Password policy dan aturan jadwal |
| `public/` | Antarmuka web |
| `tests/` | Unit test |
| `docs/` | Dokumen PDF: backlog, ERD, UI/UX, pengujian, SOP, pelatihan, laporan |

## Alur kerja tim

Branch, pull request, dan merge per WP. Lihat [CONTRIBUTING.md](CONTRIBUTING.md).

## Aturan utama

- Password: 8-255 karakter, minimal 1 simbol, 1 angka, 1 huruf kecil, 1 huruf kapital.
- Ketersediaan guru: Senin-Jumat, 08:00-20:00, blok 1 jam.
- Jenjang: SD, SMP, SMA.
- Siswa mendaftar sendiri; akun guru dibuat oleh admin.
