import { db } from "./db";

export function initDatabase() {
  db.execSync(`PRAGMA foreign_keys = ON;`);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL DEFAULT 'Chef',
      birthday TEXT,
      avatar TEXT
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      total_duration_seconds INTEGER DEFAULT 0,
      cover_image TEXT,
      poster_image TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      amount TEXT,
      FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      step_order INTEGER NOT NULL,
      instruction TEXT NOT NULL,
      duration_seconds INTEGER DEFAULT 0,
      has_timer INTEGER DEFAULT 0,
      FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS favorites (
      recipe_id INTEGER PRIMARY KEY,
      FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
    );
  `);

  const columns = db.getAllSync<{ name: string }>(`PRAGMA table_info(recipes)`);
  if (!columns.some((col) => col.name === "cook_count")) {
    db.execSync(`ALTER TABLE recipes ADD COLUMN cook_count INTEGER DEFAULT 0`);
  }
  if (!columns.some((col) => col.name === "video_url")) {
    db.execSync(`ALTER TABLE recipes ADD COLUMN video_url TEXT`);
  }

  const existingProfile = db.getFirstSync<{ id: number }>(
    `SELECT id FROM profile WHERE id = 1`,
  );
  if (!existingProfile) {
    db.runSync(
      `INSERT INTO profile (id, name, birthday) VALUES (1, 'Chef', NULL)`,
    );
  }

  seedInitialRecipes();
}

function insertRecipe(
  title: string,
  category: string,
  coverImage: string,
  ingredients: { name: string; amount: string }[],
  steps: { instruction: string; durationSeconds: number; hasTimer: boolean }[],
) {
  const totalDuration = steps.reduce((sum, s) => sum + s.durationSeconds, 0);

  const result = db.runSync(
    `INSERT INTO recipes (title, category, total_duration_seconds, cover_image)
     VALUES (?, ?, ?, ?)`,
    [title, category, totalDuration, coverImage],
  );
  const recipeId = result.lastInsertRowId;

  for (const ing of ingredients) {
    db.runSync(
      `INSERT INTO ingredients (recipe_id, name, amount) VALUES (?, ?, ?)`,
      [recipeId, ing.name, ing.amount],
    );
  }

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    db.runSync(
      `INSERT INTO steps (recipe_id, step_order, instruction, duration_seconds, has_timer)
       VALUES (?, ?, ?, ?, ?)`,
      [
        recipeId,
        i + 1,
        step.instruction,
        step.durationSeconds,
        step.hasTimer ? 1 : 0,
      ],
    );
  }
}

function seedInitialRecipes() {
  const count = db.getFirstSync<{ c: number }>(
    `SELECT COUNT(*) as c FROM recipes`,
  );
  if (count && count.c > 0) return;

  insertRecipe(
    "Nasi Goreng King Adikyo",
    "Main Course",
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500",
    [
      { name: "Nasi putih", amount: "1 piring" },
      { name: "Telur", amount: "1 butir" },

      { name: "Bawang merah", amount: "4 siung" },
      { name: "Bawang putih", amount: "2 siung" },
      { name: "Cabai rawit", amount: "3 buah" },
      { name: "Kecap manis", amount: "2 sdm" },
      { name: "Garam", amount: "secukupnya" },
      { name: "Minyak goreng", amount: "3 sdm" },
      { name: "micin", amount: "secukupnya" },
      { name: "Buat dengan cinta", amount: "1 hati" },
    ],
    [
      {
        instruction:
          "Iris bawang merah, bawang putih, dan cabai merah tipis-tipis",
        durationSeconds: 120,
        hasTimer: false,
      },
      {
        instruction: "Panaskan minyak goreng dalam wajan dengan api sedang",
        durationSeconds: 120,
        hasTimer: true,
      },
      {
        instruction: "Tumis bawang merah, bawang putih, dan cabai hingga harum",
        durationSeconds: 180,
        hasTimer: true,
      },
      {
        instruction: "Masukkan telur, orak-arik hingga matang",
        durationSeconds: 120,
        hasTimer: true,
      },
      {
        instruction: "Tambahkan nasi putih, aduk rata dengan bumbu",
        durationSeconds: 180,
        hasTimer: true,
      },
      {
        instruction:
          "Tuang kecap manis dan garam, aduk hingga merata dan nasi berwarna cokelat keemasan",
        durationSeconds: 120,
        hasTimer: true,
      },
      {
        instruction:
          "Angkat dan sajikan nasi goreng dengan pelengkap sesuai selera",
        durationSeconds: 60,
        hasTimer: false,
      },
    ],
  );

  insertRecipe(
    "Quesillo",
    "Dessert",
    "/assets/menuPoster/quesillo.png",
    [
      { name: "Gula pasir (untuk karamel)", amount: "100 gram" },
      { name: "Air (untuk karamel)", amount: "50 ml" },
      { name: "Susu kental manis", amount: "1 kaleng (390 gram)" },
      {
        name: "Susu cair full cream",
        amount: "1 kaleng (takar pakai kaleng SKM)",
      },
      { name: "Telur ayam", amount: "5 butir" },
      { name: "Ekstrak vanila", amount: "1 sdt" },
    ],
    [
      {
        instruction:
          "Buat karamel: Masak gula pasir dan air di dalam panci atau loyang dengan api kecil hingga berwarna cokelat keemasan. Jangan diaduk, cukup goyangkan loyang.",
        durationSeconds: 600,
        hasTimer: true,
      },
      {
        instruction:
          "Ratakan karamel panas ke seluruh dasar dan pinggiran dinding loyang. Sisihkan dan biarkan hingga karamel mengeras.",
        durationSeconds: 300,
        hasTimer: true,
      },
      {
        instruction:
          "Siapkan adonan: Masukkan telur, susu kental manis, susu cair, dan ekstrak vanila ke dalam blender. Blender hingga semua bahan tercampur rata dan berbuih.",
        durationSeconds: 120,
        hasTimer: true,
      },
      {
        instruction:
          "Tuang adonan flan ke dalam loyang yang karamelnya sudah mengeras tadi. Tutup rapat permukaan loyang dengan aluminium foil.",
        durationSeconds: 60,
        hasTimer: false,
      },
      {
        instruction:
          "Kukus atau panggang dengan teknik au bain-marie (loyang direndam sebagian dalam wadah berisi air panas) selama 45-60 menit hingga matang.",
        durationSeconds: 3600,
        hasTimer: true,
      },
      {
        instruction:
          "Angkat dan biarkan di suhu ruang. Setelah uap panas hilang, simpan di dalam kulkas minimal 4 jam agar teksturnya set sempurna.",
        durationSeconds: 14400,
        hasTimer: true,
      },
      {
        instruction:
          "Penyajian: Sisir pinggiran loyang dengan pisau, lalu balikkan loyang di atas piring datar. Quesillo siap dinikmati dengan lelehan karamel di atasnya!",
        durationSeconds: 60,
        hasTimer: false,
      },
    ],
  );
  insertRecipe(
    "Soto Ayam",
    "Soup",
    "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500",
    [
      { name: "Ayam", amount: "500 gram" },
      { name: "Bawang merah", amount: "5 siung" },
      { name: "Bawang putih", amount: "3 siung" },
      { name: "Kunyit", amount: "2 ruas jari" },
      { name: "Jahe", amount: "1 ruas jari" },
      { name: "Serai", amount: "2 batang" },
      { name: "Daun salam", amount: "3 lembar" },
      { name: "Daun jeruk", amount: "4 lembar" },
      { name: "Garam", amount: "secukupnya" },
      { name: "Air", amount: "1.5 liter" },
      { name: "Soun", amount: "100 gram" },
      { name: "Tauge", amount: "100 gram" },
      { name: "Telur rebus", amount: "3 butir" },
      { name: "Bawang goreng", amount: "secukupnya" },
      { name: "Seledri", amount: "2 batang" },
    ],
    [
      {
        instruction:
          "Rebus ayam dalam 1.5 liter air hingga matang, angkat dan suwir-suwir dagingnya",
        durationSeconds: 1200,
        hasTimer: true,
      },
      {
        instruction: "Haluskan bawang merah, bawang putih, kunyit, dan jahe",
        durationSeconds: 180,
        hasTimer: false,
      },
      {
        instruction:
          "Tumis bumbu halus bersama serai, daun salam, dan daun jeruk hingga harum",
        durationSeconds: 180,
        hasTimer: true,
      },
      {
        instruction:
          "Masukkan bumbu tumis ke air rebusan ayam, tambahkan garam, masak hingga mendidih",
        durationSeconds: 600,
        hasTimer: true,
      },
      {
        instruction: "Rendam soun dalam air panas hingga lunak, tiriskan",
        durationSeconds: 300,
        hasTimer: true,
      },
      {
        instruction:
          "Siapkan mangkuk: tata soun, tauge, ayam suwir, dan telur rebus",
        durationSeconds: 120,
        hasTimer: false,
      },
      {
        instruction:
          "Siram dengan kuah panas, taburi bawang goreng dan seledri, sajikan hangat",
        durationSeconds: 60,
        hasTimer: false,
      },
    ],
  );

  insertRecipe(
    "Es Teh Manis",
    "Beverage",
    "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500",
    [
      { name: "Teh celup", amount: "2 kantong" },
      { name: "Gula pasir", amount: "3 sdm" },
      { name: "Air panas", amount: "300 ml" },
      { name: "Es batu", amount: "secukupnya" },
    ],
    [
      {
        instruction:
          "Seduh teh celup dengan 300ml air panas dalam teko atau gelas besar",
        durationSeconds: 300,
        hasTimer: true,
      },
      {
        instruction: "Tambahkan gula pasir, aduk hingga larut sempurna",
        durationSeconds: 60,
        hasTimer: false,
      },
      {
        instruction: "Siapkan gelas saji, isi dengan es batu secukupnya",
        durationSeconds: 30,
        hasTimer: false,
      },
      {
        instruction:
          "Tuang teh manis ke gelas berisi es batu, aduk sebentar dan sajikan",
        durationSeconds: 30,
        hasTimer: false,
      },
    ],
  );

  insertRecipe(
    "Pisang Goreng Crispy",
    "Snack",
    "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500",
    [
      { name: "Pisang kepok", amount: "6 buah" },
      { name: "Tepung terigu", amount: "150 gram" },
      { name: "Tepung beras", amount: "50 gram" },
      { name: "Gula pasir", amount: "2 sdm" },
      { name: "Garam", amount: "1/4 sdt" },
      { name: "Baking powder", amount: "1/2 sdt" },
      { name: "Air es", amount: "200 ml" },
      { name: "Minyak goreng", amount: "secukupnya" },
    ],
    [
      {
        instruction:
          "Campurkan tepung terigu, tepung beras, gula, garam, dan baking powder dalam wadah",
        durationSeconds: 120,
        hasTimer: false,
      },
      {
        instruction:
          "Tuang air es sedikit demi sedikit sambil diaduk hingga adonan licin dan agak kental",
        durationSeconds: 120,
        hasTimer: false,
      },
      {
        instruction: "Kupas pisang dan belah menjadi dua bagian memanjang",
        durationSeconds: 120,
        hasTimer: false,
      },
      {
        instruction: "Panaskan minyak goreng dalam wajan dengan api sedang",
        durationSeconds: 180,
        hasTimer: true,
      },
      {
        instruction:
          "Celupkan pisang ke dalam adonan tepung hingga terbalut rata",
        durationSeconds: 60,
        hasTimer: false,
      },
      {
        instruction:
          "Goreng pisang dalam minyak panas hingga kecokelatan dan crispy, bolak-balik agar matang merata",
        durationSeconds: 300,
        hasTimer: true,
      },
      {
        instruction:
          "Angkat dan tiriskan di atas tisu dapur, sajikan selagi hangat",
        durationSeconds: 60,
        hasTimer: false,
      },
    ],
  );
}
