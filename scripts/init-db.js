// Menjalankan db/schema.sql ke database. Aman dijalankan berulang (IF NOT EXISTS).
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/db');
const { dbHint } = require('../src/utils/http');

(async () => {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'db', 'schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('Skema database siap.');
  await pool.end();
})().catch((e) => {
  console.error(e.message);
  const hint = dbHint(e);
  if (hint) console.error(hint);
  process.exit(1);
});
