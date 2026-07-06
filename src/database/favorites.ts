import { db } from "./db";
import type { Recipe } from "./recipes";

export function isFavorite(recipeId: number): boolean {
  const row = db.getFirstSync(
    `SELECT recipe_id FROM favorites WHERE recipe_id = ?`,
    [recipeId],
  );
  return !!row;
}

export function toggleFavorite(recipeId: number) {
  if (isFavorite(recipeId)) {
    db.runSync(`DELETE FROM favorites WHERE recipe_id = ?`, [recipeId]);
  } else {
    db.runSync(`INSERT INTO favorites (recipe_id) VALUES (?)`, [recipeId]);
  }
}

export function getFavoriteRecipes(): Recipe[] {
  return db.getAllSync(`
    SELECT recipes.* FROM recipes
    INNER JOIN favorites ON favorites.recipe_id = recipes.id
    ORDER BY recipes.created_at DESC
  `);
}
