const express = require('express');
const db = require('../db');
const { HttpError, wrap } = require('../utils/http');
const { authenticate, requireRole } = require('../middleware/auth');
const { validateSlot, slotEnd, todayWIB } = require('../rules/scheduleRules');

const router = express.Router();
router.use(authenticate, requireRole('teacher'));

router.get('/me', wrap(async (req, res) => {
  const { rows } = await db.query(
    `SELECT id, day_of_week, to_char(start_time, 'HH24:MI') AS start_time,
            to_char(end_time, 'HH24:MI') AS end_time
     FROM availability WHERE teacher_id = $1 ORDER BY day_of_week, start_time`, [req.user.id]);
  res.json(rows);
}));

router.post('/', wrap(async (req, res) => {
  const check = validateSlot(req.body);
  if (!check.ok) throw new HttpError(400, check.errors.join('. '));
  const { rows } = await db.query(
    `INSERT INTO availability (teacher_id, day_of_week, start_time, end_time)
     VALUES ($1, $2, $3, $4)
     RETURNING id, day_of_week, to_char(start_time, 'HH24:MI') AS start_time,
               to_char(end_time, 'HH24:MI') AS end_time`,
    [req.user.id, Number(req.body.day_of_week), req.body.start_time, slotEnd(req.body.start_time)]);
  res.status(201).json(rows[0]);
}));

router.delete('/:id(\\d+)', wrap(async (req, res) => {
  const slot = (await db.query(
    'SELECT id FROM availability WHERE id = $1 AND teacher_id = $2', [req.params.id, req.user.id])).rows[0];
  if (!slot) throw new HttpError(404, 'Slot tidak ditemukan');
  const active = await db.query(
    `SELECT 1 FROM lessons WHERE availability_id = $1 AND status = 'scheduled' AND lesson_date >= $2 LIMIT 1`,
    [slot.id, todayWIB()]);
  if (active.rowCount) {
    throw new HttpError(409, 'Slot masih punya les terjadwal. Ajukan pengunduran diri di halaman Les saya terlebih dahulu');
  }
  await db.query('DELETE FROM availability WHERE id = $1', [slot.id]);
  res.status(204).end();
}));

module.exports = { path: '/api/availability', router };
