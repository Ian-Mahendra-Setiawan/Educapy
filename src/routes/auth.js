const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');
const { HttpError, wrap } = require('../utils/http');
const { authenticate } = require('../middleware/auth');
const { validatePassword, hashPassword, verifyPassword } = require('../security/password');

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Registrasi mandiri siswa (WP 2.1.1). Peran selalu 'student'.
router.post('/register', wrap(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const { password } = req.body;

  if (name.length < 2 || name.length > 100) throw new HttpError(400, 'Nama harus 2-100 karakter');
  if (!EMAIL_RE.test(email) || email.length > 255) throw new HttpError(400, 'Format email tidak valid');
  const check = validatePassword(password);
  if (!check.ok) throw new HttpError(400, check.errors.join('. '));

  const hash = await hashPassword(password);
  const { rows } = await db.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'student') RETURNING id, name, email, role`,
    [name, email, hash]);
  res.status(201).json(rows[0]);
}));

router.post('/login', wrap(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = req.body.password;
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  const ok = user && typeof password === 'string' && await verifyPassword(password, user.password_hash);
  if (!ok) throw new HttpError(401, 'Email atau password salah');
  const token = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}));

router.get('/me', authenticate, (req, res) => res.json(req.user));

module.exports = { path: '/api/auth', router };
