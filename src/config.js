require('dotenv').config();

const config = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
};

if (process.env.NODE_ENV !== 'test') {
  if (!config.databaseUrl) throw new Error('DATABASE_URL belum diatur di .env');
  if (!config.jwtSecret || config.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET belum diatur atau kurang dari 32 karakter');
  }
}

module.exports = config;
