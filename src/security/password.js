const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const MIN_LENGTH = 8;
const MAX_LENGTH = 255;

// Password policy (WP 2.1.2): 8-255 karakter, minimal 1 simbol, 1 angka,
// 1 huruf kecil, dan 1 huruf kapital.
function validatePassword(password) {
  if (typeof password !== 'string') {
    return { ok: false, errors: ['Password wajib diisi'] };
  }
  const errors = [];
  if (password.length < MIN_LENGTH || password.length > MAX_LENGTH) {
    errors.push(`Password harus ${MIN_LENGTH}-${MAX_LENGTH} karakter`);
  }
  if (!/[0-9]/.test(password)) errors.push('Password harus memuat minimal 1 angka');
  if (!/[a-z]/.test(password)) errors.push('Password harus memuat minimal 1 huruf kecil');
  if (!/[A-Z]/.test(password)) errors.push('Password harus memuat minimal 1 huruf kapital');
  if (!/[^A-Za-z0-9\s]/.test(password)) errors.push('Password harus memuat minimal 1 simbol');
  return { ok: errors.length === 0, errors };
}

// bcrypt hanya membaca 72 byte pertama, sedangkan policy mengizinkan sampai 255 karakter.
// SHA-256 dulu agar seluruh karakter ikut memengaruhi hash.
const prehash = (password) =>
  crypto.createHash('sha256').update(password, 'utf8').digest('base64');

const hashPassword = (password) => bcrypt.hash(prehash(password), 10);
const verifyPassword = (password, hash) => bcrypt.compare(prehash(password), hash);

module.exports = { validatePassword, hashPassword, verifyPassword, MIN_LENGTH, MAX_LENGTH };
