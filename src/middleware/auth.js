const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');
const { HttpError } = require('../utils/http');

// Memverifikasi token lalu memuat pengguna dari database,
// sehingga akun yang sudah dihapus atau diubah perannya langsung berlaku.
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new HttpError(401, 'Silakan masuk terlebih dahulu');
    let payload;
    try {
      payload = jwt.verify(token, config.jwtSecret);
    } catch {
      throw new HttpError(401, 'Sesi tidak valid atau sudah berakhir. Silakan masuk lagi');
    }
    const { rows } = await db.query(
      'SELECT id, name, email, role FROM users WHERE id = $1', [payload.id]);
    if (!rows[0]) throw new HttpError(401, 'Akun tidak ditemukan');
    req.user = rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : next(new HttpError(403, 'Anda tidak punya akses ke fitur ini'));

module.exports = { authenticate, requireRole };
