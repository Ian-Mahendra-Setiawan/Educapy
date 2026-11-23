const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// SEMENTARA (WP 2.1.1): validasi ketat ditambahkan di WP 2.1.2.
function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 1) {
    return { ok: false, errors: ['Password wajib diisi'] };
  }
  return { ok: true, errors: [] };
}

const prehash = (password) =>
  crypto.createHash('sha256').update(password, 'utf8').digest('base64');

const hashPassword = (password) => bcrypt.hash(prehash(password), 10);
const verifyPassword = (password, hash) => bcrypt.compare(prehash(password), hash);

module.exports = { validatePassword, hashPassword, verifyPassword };
