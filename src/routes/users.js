const express = require('express');
const db = require('../db');
const { HttpError, wrap } = require('../utils/http');
const { authenticate, requireRole } = require('../middleware/auth');
const { validatePassword, hashPassword } = require('../security/password');

const router = express.Router();
router.use(authenticate, requireRole('admin'));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MANAGED_ROLES = ['teacher', 'student'];
const COLUMNS = 'id, name, email, role, created_at';

function cleanProfile(body) {
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  if (name.length < 2 || name.length > 100) throw new HttpError(400, 'Nama harus 2-100 karakter');
  if (!EMAIL_RE.test(email) || email.length > 255) throw new HttpError(400, 'Format email tidak valid');
  return { name, email };
}

router.get('/', wrap(async (req, res) => {
  const { role } = req.query;
  if (role && !['admin', ...MANAGED_ROLES].includes(role)) throw new HttpError(400, 'Peran tidak valid');
  const { rows } = role
    ? await db.query(`SELECT ${COLUMNS} FROM users WHERE role = $1 ORDER BY name`, [role])
    : await db.query(`SELECT ${COLUMNS} FROM users ORDER BY role, name`);
  res.json(rows);
}));

router.get('/:id(\\d+)', wrap(async (req, res) => {
  const { rows } = await db.query(`SELECT ${COLUMNS} FROM users WHERE id = $1`, [req.params.id]);
  if (!rows[0]) throw new HttpError(404, 'Pengguna tidak ditemukan');
  res.json(rows[0]);
}));

// Admin hanya boleh membuat akun guru dan siswa
router.post('/', wrap(async (req, res) => {
  const { name, email } = cleanProfile(req.body);
  if (!MANAGED_ROLES.includes(req.body.role)) throw new HttpError(400, 'Peran harus teacher atau student');
  const check = validatePassword(req.body.password);
  if (!check.ok) throw new HttpError(400, check.errors.join('. '));
  const hash = await hashPassword(req.body.password);
  const { rows } = await db.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING ${COLUMNS}`,
    [name, email, hash, req.body.role]);
  res.status(201).json(rows[0]);
}));

// Peran tidak bisa diubah. Password hanya diganti bila diisi.
router.put('/:id(\\d+)', wrap(async (req, res) => {
  const { name, email } = cleanProfile(req.body);
  const target = (await db.query('SELECT role FROM users WHERE id = $1', [req.params.id])).rows[0];
  if (!target) throw new HttpError(404, 'Pengguna tidak ditemukan');
  if (target.role === 'admin' && Number(req.params.id) !== req.user.id) {
    throw new HttpError(403, 'Akun admin lain tidak dapat diubah');
  }
  if (req.body.password) {
    const check = validatePassword(req.body.password);
    if (!check.ok) throw new HttpError(400, check.errors.join('. '));
    const hash = await hashPassword(req.body.password);
    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.params.id]);
  }
  const { rows } = await db.query(
    `UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING ${COLUMNS}`,
    [name, email, req.params.id]);
  res.json(rows[0]);
}));

router.delete('/:id(\\d+)', wrap(async (req, res) => {
  const target = (await db.query('SELECT role FROM users WHERE id = $1', [req.params.id])).rows[0];
  if (!target) throw new HttpError(404, 'Pengguna tidak ditemukan');
  if (!MANAGED_ROLES.includes(target.role)) throw new HttpError(403, 'Akun admin tidak dapat dihapus');
  await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
  res.status(204).end();
}));

module.exports = { path: '/api/users', router };
