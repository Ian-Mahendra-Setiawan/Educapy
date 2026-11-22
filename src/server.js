const config = require('./config');
const app = require('./app');
const db = require('./db');
const { dbHint } = require('./utils/http');

app.listen(config.port, async () => {
  console.log(`EduCapy berjalan di http://localhost:${config.port}`);
  try {
    const r = await db.query("SELECT to_regclass('public.users') AS users");
    if (r.rows[0].users) console.log('Database terhubung.');
    else console.warn(`PERINGATAN: ${dbHint({ code: '42P01' })}`);
  } catch (err) {
    console.error(`PERINGATAN: tidak bisa memakai database. ${dbHint(err) || err.message}`);
  }
});
