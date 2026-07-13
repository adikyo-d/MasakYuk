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

  // 🚀 TAMBAHAN BARU: Kolom untuk Sinkronisasi Supabase
  if (!columns.some((col) => col.name === "cloud_id")) {
    db.execSync(`ALTER TABLE recipes ADD COLUMN cloud_id TEXT`);
  }
  if (!columns.some((col) => col.name === "is_synced")) {
    // Default 0 berarti setiap resep baru wajib di-sync
    db.execSync(`ALTER TABLE recipes ADD COLUMN is_synced INTEGER DEFAULT 0`);
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
    "/assets/images/placeholders/nasiGoreng.jpg",
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
    "/assets/images/placeholders/quesillo.png",
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
    "Fluffy Pancake",
    "Dessert",
    "/assets/images/placeholders/pancake.jpg",
    [
      { name: "Tepung terigu", amount: "150 gram" },
      { name: "Gula pasir", amount: "2 sdm" },
      { name: "Baking powder", amount: "1 sdt" },
      { name: "Susu cair", amount: "150 ml" },
      { name: "Telur", amount: "1 butir" },
      { name: "Mentega cair", amount: "2 sdm" },
      { name: "Madu/Maple Syrup", amount: "secukupnya" },
    ],
    [
      {
        instruction:
          "Campurkan tepung terigu, gula pasir, dan baking powder di dalam mangkuk besar.",
        durationSeconds: 120,
        hasTimer: false,
      },
      {
        instruction:
          "Masukkan susu cair, telur, dan mentega cair. Aduk perlahan hingga tercampur rata (jangan *overmix*).",
        durationSeconds: 180,
        hasTimer: false,
      },
      {
        instruction: "Panaskan teflon anti lengket dengan api kecil.",
        durationSeconds: 120,
        hasTimer: true,
      },
      {
        instruction:
          "Tuang 1 sendok sayur adonan ke atas teflon. Masak hingga muncul gelembung bersarang di permukaannya.",
        durationSeconds: 180,
        hasTimer: true,
      },
      {
        instruction:
          "Balik pancake dan masak sebentar sisi lainnya hingga kecokelatan. Angkat dan sajikan dengan madu.",
        durationSeconds: 60,
        hasTimer: true,
      },
    ],
  );

  // 2. Classic Sponge Cake
  insertRecipe(
    "Classic Sponge Cake",
    "Dessert",
    "/assets/images/placeholders/spongeCake.jpg",
    [
      { name: "Telur", amount: "4 butir" },
      { name: "Gula pasir", amount: "100 gram" },
      { name: "SP / Emulsifier", amount: "1 sdt" },
      { name: "Tepung terigu protein sedang", amount: "100 gram" },
      { name: "Mentega (dilelehkan)", amount: "50 gram" },
      { name: "Vanili bubuk", amount: "1/2 sdt" },
    ],
    [
      {
        instruction:
          "Siapkan loyang, olesi dengan mentega dan taburi sedikit tepung. Panaskan oven di suhu 170°C.",
        durationSeconds: 600,
        hasTimer: true,
      },
      {
        instruction:
          "Kocok telur, gula pasir, dan SP dengan mixer kecepatan tinggi hingga putih, kental, dan berjejak.",
        durationSeconds: 420,
        hasTimer: true,
      },
      {
        instruction:
          "Turunkan kecepatan mixer, masukkan tepung terigu dan vanili sedikit demi sedikit hingga rata.",
        durationSeconds: 120,
        hasTimer: false,
      },
      {
        instruction:
          "Matikan mixer. Tuang mentega leleh, lalu aduk balik menggunakan spatula hingga tidak ada mentega yang mengendap.",
        durationSeconds: 180,
        hasTimer: false,
      },
      {
        instruction:
          "Tuang adonan ke loyang. Panggang dalam oven hingga matang sempurna.",
        durationSeconds: 2100, // 35 menit
        hasTimer: true,
      },
    ],
  );

  // 3. Chewy Soft Cookies
  insertRecipe(
    "Chewy Soft Cookies",
    "Snack",
    "/assets/images/placeholders/softCookies.jpg",
    [
      { name: "Mentega (suhu ruang)", amount: "115 gram" },
      { name: "Gula palem (Brown sugar)", amount: "100 gram" },
      { name: "Gula pasir", amount: "50 gram" },
      { name: "Telur", amount: "1 butir" },
      { name: "Tepung terigu protein sedang", amount: "180 gram" },
      { name: "Baking soda", amount: "1/2 sdt" },
      { name: "Chocochip", amount: "150 gram" },
    ],
    [
      {
        instruction:
          "Kocok mentega, gula palem, dan gula pasir hingga lembut dan creamy.",
        durationSeconds: 180,
        hasTimer: true,
      },
      {
        instruction: "Tambahkan telur dan aduk kembali hingga rata.",
        durationSeconds: 60,
        hasTimer: false,
      },
      {
        instruction:
          "Masukkan tepung terigu dan baking soda yang sudah diayak. Aduk rata menggunakan spatula.",
        durationSeconds: 120,
        hasTimer: false,
      },
      {
        instruction:
          "Masukkan chocochip, aduk rata. Tutup adonan dan diamkan di dalam kulkas agar tidak melebar saat dipanggang.",
        durationSeconds: 1800, // 30 menit
        hasTimer: true,
      },
      {
        instruction:
          "Bentuk adonan menjadi bola-bola, susun di loyang. Panggang di suhu 175°C hingga pinggirannya mulai kecokelatan namun tengahnya masih lembut.",
        durationSeconds: 720, // 12 menit
        hasTimer: true,
      },
    ],
  );

  // 4. Beef Kebab
  insertRecipe(
    "Beef Kebab Homemade",
    "Main Course",
    "/assets/images/placeholders/kebab.jpg",
    [
      { name: "Kulit Tortilla", amount: "4 lembar" },
      { name: "Daging sapi iris", amount: "200 gram" },
      { name: "Bawang bombay (iris memanjang)", amount: "1/2 buah" },
      { name: "Selada (iris tipis)", amount: "secukupnya" },
      { name: "Tomat (iris tipis)", amount: "1 buah" },
      { name: "Saus tomat & Saus sambal", amount: "secukupnya" },
      { name: "Mayones", amount: "secukupnya" },
    ],
    [
      {
        instruction:
          "Tumis bawang bombay sebentar, lalu masukkan daging sapi iris. Masak hingga daging matang, beri sedikit garam dan lada.",
        durationSeconds: 300,
        hasTimer: true,
      },
      {
        instruction:
          "Panaskan kulit tortilla di atas teflon tanpa minyak sebentar saja agar lentur, lalu angkat.",
        durationSeconds: 60,
        hasTimer: true,
      },
      {
        instruction:
          "Bentangkan tortilla, tata selada, tomat, bawang bombay, dan daging sapi di bagian tengah.",
        durationSeconds: 120,
        hasTimer: false,
      },
      {
        instruction: "Beri saus tomat, saus sambal, dan mayones sesuai selera.",
        durationSeconds: 60,
        hasTimer: false,
      },
      {
        instruction:
          "Gulung kebab dengan rapat. Panggang kembali di atas teflon yang diberi sedikit margarin hingga kecokelatan.",
        durationSeconds: 180,
        hasTimer: true,
      },
    ],
  );

  // 5. Refreshing Virgin Mojito (Mocktail)
  insertRecipe(
    "Refreshing Virgin Mojito",
    "Beverage",
    "/assets/images/placeholders/mocktail.jpg",
    [
      { name: "Daun mint segar", amount: "10-12 lembar" },
      { name: "Jeruk nipis (potong-potong)", amount: "1 buah" },
      { name: "Simple syrup (air gula)", amount: "2 sdm" },
      { name: "Es batu", amount: "secukupnya" },
      { name: "Air soda jernih (Sprite/Soda water)", amount: "200 ml" },
    ],
    [
      {
        instruction:
          "Masukkan potongan jeruk nipis dan daun mint ke dalam gelas saji tebal.",
        durationSeconds: 30,
        hasTimer: false,
      },
      {
        instruction:
          "Tumbuk perlahan jeruk nipis dan daun mint menggunakan *muddler* atau ujung sendok kayu agar sari dan aromanya keluar.",
        durationSeconds: 60,
        hasTimer: false,
      },
      {
        instruction: "Tuangkan simple syrup ke dalam gelas, aduk sebentar.",
        durationSeconds: 30,
        hasTimer: false,
      },
      {
        instruction: "Isi gelas dengan es batu hingga penuh.",
        durationSeconds: 30,
        hasTimer: false,
      },
      {
        instruction:
          "Tuang air soda hingga memenuhi gelas. Aduk perlahan dari bawah ke atas. Sajikan dingin.",
        durationSeconds: 60,
        hasTimer: false,
      },
    ],
  );

  // 6. Double Chocolate Milkshake
  insertRecipe(
    "Double Chocolate Milkshake",
    "Beverage",
    "/assets/images/placeholders/double-chocolate-milkshake.jpg",
    [
      { name: "Susu cair full cream (dingin)", amount: "200 ml" },
      { name: "Es krim cokelat", amount: "3 scoop" },
      { name: "Sirup cokelat / Kental manis cokelat", amount: "2 sdm" },
      { name: "Es batu", amount: "secukupnya" },
      { name: "Whipped cream (opsional)", amount: "untuk topping" },
      { name: "Chocochip (opsional)", amount: "untuk taburan" },
    ],
    [
      {
        instruction:
          "Siapkan gelas saji, hias bagian dinding dalam gelas dengan sirup cokelat agar terlihat estetik. Simpan gelas di kulkas.",
        durationSeconds: 120,
        hasTimer: false,
      },
      {
        instruction:
          "Masukkan susu cair dingin, es krim cokelat, dan es batu ke dalam blender.",
        durationSeconds: 60,
        hasTimer: false,
      },
      {
        instruction:
          "Blender dengan kecepatan tinggi hingga semua bahan tercampur halus dan kental.",
        durationSeconds: 90,
        hasTimer: true,
      },
      {
        instruction:
          "Keluarkan gelas saji dari kulkas, tuangkan milkshake cokelat ke dalamnya.",
        durationSeconds: 30,
        hasTimer: false,
      },
      {
        instruction:
          "Semprotkan whipped cream di atasnya dan taburi dengan chocochip atau sisa sirup cokelat. Sajikan segera.",
        durationSeconds: 60,
        hasTimer: false,
      },
    ],
  );
}
