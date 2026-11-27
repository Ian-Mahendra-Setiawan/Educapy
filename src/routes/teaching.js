const express = require('express');
const db = require('../db');
const { HttpError, wrap } = require('../utils/http');
const { authenticate, requireRole } = require('../middleware/auth');
const { LEVELS } = require('../rules/scheduleRules');

const router = express.Router();
router.use(authenticate);

router.get('/subjects', wrap(async (req, res) => {
  const { rows } = await db.query('SELECT id, name FROM subjects ORDER BY name');
  res.json({ subjects: rows, levels: LEVELS });
}));

router.get('/me', requireRole('teacher'), wrap(async (req, res) => {
  const { rows } = await db.query(
    `SELECT ts.subject_id, s.name AS subject, ts.level
     FROM teacher_subjects ts JOIN subjects s ON s.id = ts.subject_id
     WHERE ts.teacher_id = $1 ORDER BY s.name, ts.level`, [req.user.id]);
  res.json(rows);
}));

// Mengganti seluruh daftar mapel + jenjang guru: { items: [{ subject_id, level }] }
router.put('/me', requireRole('teacher'), wrap(async (req, res) => {
  const items = req.body.items;
  if (!Array.isArray(items) || items.length > 100) throw new HttpError(400, 'Daftar mata pelajaran tidak valid');
  const unique = new Map();
  for (const it of items) {
    const subjectId = Number(it.subject_id);
    if (!Number.isInteger(subjectId) || !LEVELS.includes(it.level)) {
      throw new HttpError(400, 'Mata pelajaran atau jenjang tidak valid (jenjang: SD, SMP, SMA)');
    }
    unique.set(`${subjectId}:${it.level}`, [subjectId, it.level]);
  }
  const ids = [...new Set([...unique.values()].map((v) => v[0]))];
  if (ids.length) {
    const found = await db.query('SELECT id FROM subjects WHERE id = ANY($1::int[])', [ids]);
    if (found.rowCount !== ids.length) throw new HttpError(400, 'Ada mata pelajaran yang tidak ditemukan');
  }
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM teacher_subjects WHERE teacher_id = $1', [req.user.id]);
    for (const [subjectId, level] of unique.values()) {
      await client.query(
        'INSERT INTO teacher_subjects (teacher_id, subject_id, level) VALUES ($1, $2, $3)',
        [req.user.id, subjectId, level]);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
  res.json({ saved: unique.size });
}));

module.exports = { path: '/api/teaching', router };
