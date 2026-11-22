const fs = require('fs');
const path = require('path');
const express = require('express');
const { dbHint } = require('./utils/http');

const app = express();
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Setiap file di src/routes mengekspor { path, router } dan dimuat otomatis.
const routesDir = path.join(__dirname, 'routes');
const routeFiles = fs.existsSync(routesDir) ? fs.readdirSync(routesDir) : [];
for (const file of routeFiles.filter((f) => f.endsWith('.js')).sort()) {
  const mod = require(path.join(routesDir, file));
  app.use(mod.path, mod.router);
}

app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint tidak ditemukan' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.code === '23505') return res.status(409).json({ error: 'Data sudah ada' });
  if (err.code === '23503') return res.status(409).json({ error: 'Data masih dipakai data lain' });
  const hint = dbHint(err);
  if (hint) {
    console.error(`[DATABASE] ${hint}\n  Detail: ${err.message}`);
    return res.status(503).json({ error: `Database belum siap. ${hint}` });
  }
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: status === 500 ? 'Kesalahan server' : err.message });
});

module.exports = app;
