import { db } from "./db";

export function initDatabase() {
  // Aktifkan foreign key constraint (SQLite default-nya OFF)
  db.execSync(`PRAGMA foreign_keys = ON;`);

  db.execSync(`
    -- Tabel profil user (single row, id selalu = 1)
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL DEFAULT 'Chef',
      birthday TEXT,              -- format: YYYY-MM-DD
      avatar TEXT
    );

    -- Tabel resep utama
    CREATE TABLE IF NOT EXISTS recipes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  total_duration_seconds INTEGER DEFAULT 0,  -- dihitung dari SUM semua step
  cover_image TEXT,
  poster_image TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

    -- Bahan-bahan (relasi 1 resep → banyak bahan)
    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      amount TEXT,
      FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
    );

    -- Langkah-langkah (relasi 1 resep → banyak langkah, berurutan)
    CREATE TABLE IF NOT EXISTS steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER NOT NULL,
  step_order INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  duration_seconds INTEGER DEFAULT 0,   -- 0 = tidak butuh timer
  has_timer INTEGER DEFAULT 0,          -- 0 = false, 1 = true (SQLite tidak punya BOOLEAN asli)
  FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
);

    -- Favorit (relasi many-to-many sederhana: 1 user, banyak resep favorit)
    CREATE TABLE IF NOT EXISTS favorites (
      recipe_id INTEGER PRIMARY KEY,
      FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
    );
  `);

  // Pastikan selalu ada 1 baris profil default
  const existingProfile = db.getFirstSync(
    `SELECT id FROM profile WHERE id = 1`,
  );
  if (!existingProfile) {
    db.runSync(
      `INSERT INTO profile (id, name, birthday) VALUES (1, 'Chef', NULL)`,
    );
  }
}
