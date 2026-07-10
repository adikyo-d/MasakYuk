import { db } from "./db";

export type Recipe = {
  id: number;
  title: string;
  category: string;
  total_duration_seconds: number;
  cover_image: string | null;
  poster_image: string | null;
  created_at: string;
  cook_count: number;
};

type IngredientInput = { name: string; amount: string };

type StepInput = {
  instruction: string;
  hasTimer: boolean;
  durationSeconds: number; // 0 kalau hasTimer false
};

export function addRecipe(
  title: string,
  category: string,
  coverImage: string,
  ingredients: IngredientInput[],
  steps: StepInput[],
  posterImage?: string,
) {
  // Hitung total durasi dari seluruh step
  const totalDuration = steps.reduce(
    (sum, step) => sum + step.durationSeconds,
    0,
  );

  const result = db.runSync(
    `INSERT INTO recipes (title, category, total_duration_seconds, cover_image, poster_image)
     VALUES (?, ?, ?, ?, ?)`,
    [title, category, totalDuration, coverImage, posterImage ?? null],
  );
  const recipeId = result.lastInsertRowId;

  ingredients.forEach((ing) => {
    db.runSync(
      `INSERT INTO ingredients (recipe_id, name, amount) VALUES (?, ?, ?)`,
      [recipeId, ing.name, ing.amount],
    );
  });

  steps.forEach((step, index) => {
    db.runSync(
      `INSERT INTO steps (recipe_id, step_order, instruction, duration_seconds, has_timer)
       VALUES (?, ?, ?, ?, ?)`,
      [
        recipeId,
        index + 1,
        step.instruction,
        step.durationSeconds,
        step.hasTimer ? 1 : 0,
      ],
    );
  });

  return recipeId;
}
export function getAllRecipes(): Recipe[] {
  return db.getAllSync(`SELECT * FROM recipes ORDER BY created_at DESC`);
}

export function getRecipeDetail(id: number) {
  const recipe = db.getFirstSync<Recipe>(`SELECT * FROM recipes WHERE id = ?`, [
    id,
  ]);
  const ingredients = db.getAllSync(
    `SELECT * FROM ingredients WHERE recipe_id = ?`,
    [id],
  );
  const steps = db.getAllSync(
    `SELECT * FROM steps WHERE recipe_id = ? ORDER BY step_order`,
    [id],
  );
  return { recipe, ingredients, steps };
}

export function updatePosterImage(recipeId: number, posterImagePath: string) {
  db.runSync(`UPDATE recipes SET poster_image = ? WHERE id = ?`, [
    posterImagePath,
    recipeId,
  ]);
}

export function deleteRecipe(id: number) {
  db.runSync(`DELETE FROM recipes WHERE id = ?`, [id]);
}

export function recalculateTotalDuration(recipeId: number) {
  const result = db.getFirstSync<{ total: number }>(
    `SELECT SUM(duration_seconds) as total FROM steps WHERE recipe_id = ?`,
    [recipeId],
  );
  const total = result?.total ?? 0;
  db.runSync(`UPDATE recipes SET total_duration_seconds = ? WHERE id = ?`, [
    total,
    recipeId,
  ]);
  return total;
}

export function incrementCookCount(recipeId: number) {
  db.runSync(
    `UPDATE recipes SET cook_count = COALESCE(cook_count, 0) + 1 WHERE id = ?`,
    [recipeId],
  );
}

export function updateRecipe(
  recipeId: number,
  title: string,
  category: string,
  coverImage: string,
  ingredients: { name: string; amount: string }[],
  steps: { instruction: string; hasTimer: boolean; durationSeconds: number }[],
) {
  // Hitung total durasi baru
  const totalDuration = steps.reduce(
    (sum, step) => sum + (step.hasTimer ? step.durationSeconds : 0),
    0,
  );

  db.withTransactionSync(() => {
    // 1. Perbarui tabel resep utama
    db.runSync(
      `UPDATE recipes 
       SET title = ?, category = ?, cover_image = ?, total_duration_seconds = ?
       WHERE id = ?`,
      [title, category, coverImage, totalDuration, recipeId],
    );

    // 2. Hapus bahan lama dan masukkan yang baru
    db.runSync(`DELETE FROM ingredients WHERE recipe_id = ?`, [recipeId]);
    for (const ing of ingredients) {
      db.runSync(
        `INSERT INTO ingredients (recipe_id, name, amount) VALUES (?, ?, ?)`,
        [recipeId, ing.name, ing.amount],
      );
    }

    // 3. Hapus langkah lama dan masukkan yang baru
    db.runSync(`DELETE FROM steps WHERE recipe_id = ?`, [recipeId]);
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      db.runSync(
        `INSERT INTO steps (recipe_id, step_order, instruction, has_timer, duration_seconds) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          recipeId,
          i + 1,
          step.instruction,
          step.hasTimer ? 1 : 0,
          step.durationSeconds,
        ],
      );
    }
  });
}
