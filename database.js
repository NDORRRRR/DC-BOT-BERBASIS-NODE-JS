const sqlite3 = require('better-sqlite3');

// Membuat dan mengekspor satu koneksi database untuk digunakan di seluruh aplikasi
const db = new sqlite3('bot.db');

// Inisialisasi tabel jika belum ada
db.prepare(`
  CREATE TABLE IF NOT EXISTS prefixes (
    guild_id TEXT PRIMARY KEY,
    prefix TEXT NOT NULL
  )
`).run();

module.exports = db;