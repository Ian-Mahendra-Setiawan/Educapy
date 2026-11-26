// Aturan jadwal EduCapy. Fungsi murni agar mudah diuji.
const OPEN_HOUR = 8;
const CLOSE_HOUR = 20;
const LEVELS = ['SD', 'SMP', 'SMA'];

const pad = (n) => String(n).padStart(2, '0');

// Slot guru: Senin(1)-Jumat(5), mulai pada jam bulat 08:00-19:00, durasi 1 jam (selesai maks 20:00).
function validateSlot({ day_of_week, start_time }) {
  const errors = [];
  const day = Number(day_of_week);
  if (!Number.isInteger(day) || day < 1 || day > 5) errors.push('Hari harus Senin sampai Jumat');
  const m = /^(\d{2}):(\d{2})(?::00)?$/.exec(String(start_time || ''));
  if (!m) {
    errors.push('Jam mulai harus berformat HH:MM');
  } else {
    const h = Number(m[1]); const min = Number(m[2]);
    if (min !== 0) errors.push('Jam mulai harus tepat di jam bulat (contoh 09:00)');
    if (h < OPEN_HOUR || h + 1 > CLOSE_HOUR) errors.push('Jam mengajar hanya 08:00 sampai 20:00');
  }
  return { ok: errors.length === 0, errors };
}

function slotEnd(start_time) {
  return `${pad(Number(String(start_time).slice(0, 2)) + 1)}:00`;
}

function isValidDate(str) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(str))) return false;
  const [y, m, d] = str.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

// 1 = Senin ... 7 = Minggu
function weekdayOf(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const w = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return w === 0 ? 7 : w;
}

function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

function daysBetween(from, to) {
  const t = (s) => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  return Math.round((t(to) - t(from)) / 86400000);
}

// Tanggal hari ini di zona WIB (UTC+7)
function todayWIB(now = new Date()) {
  const d = new Date(now.getTime() + 7 * 3600 * 1000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

module.exports = {
  OPEN_HOUR, CLOSE_HOUR, LEVELS,
  validateSlot, slotEnd, isValidDate, weekdayOf, addDays, daysBetween, todayWIB,
};
