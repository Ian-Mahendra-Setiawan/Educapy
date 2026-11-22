class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Membungkus handler async agar error diteruskan ke error middleware (Express 4)
const wrap = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Penjelasan singkat untuk galat database yang paling sering muncul saat pemasangan
const DB_HINTS = {
  '42P01': 'Tabel belum dibuat. Jalankan: npm run db:init',
  '28P01': 'Login database ditolak. Periksa user dan password pada DATABASE_URL di berkas .env',
  '28000': 'Login database ditolak. Periksa user dan password pada DATABASE_URL di berkas .env',
  '3D000': 'Database tidak ditemukan. Buat database-nya, lalu periksa nama database pada DATABASE_URL',
  ECONNREFUSED: 'PostgreSQL tidak berjalan, atau host dan port pada DATABASE_URL salah',
  ENOTFOUND: 'Host database pada DATABASE_URL tidak ditemukan',
  ETIMEDOUT: 'Koneksi ke database kehabisan waktu. Periksa host dan port pada DATABASE_URL',
};
const dbHint = (err) => DB_HINTS[err && (err.code || (err.errors && err.errors[0] && err.errors[0].code))] || null;

module.exports = { HttpError, wrap, dbHint };
