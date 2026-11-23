// Membuat akun admin dari ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD di .env
const db = require('../src/db');
const { validatePassword, hashPassword } = require('../src/security/password');

(async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Isi ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD di .env');
  }
  const check = validatePassword(ADMIN_PASSWORD);
  if (!check.ok) throw new Error(check.errors.join('. '));
  const hash = await hashPassword(ADMIN_PASSWORD);
  const r = await db.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin') ON CONFLICT (email) DO NOTHING RETURNING id`,
    [ADMIN_NAME, ADMIN_EMAIL.toLowerCase(), hash]);
  console.log(r.rowCount ? 'Akun admin dibuat.' : 'Akun admin sudah ada, tidak diubah.');
  await db.pool.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
