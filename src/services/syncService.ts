import {
    addRecipe,
    getAllRecipes,
    getRecipeDetail,
    getUnsyncedRecipes,
    markRecipeAsSynced,
} from "@/database/recipes";
import { supabase } from "@/lib/supabase";

export async function syncRecipesToCloud() {
  console.log("Memulai proses sinkronisasi...");

  // 1. Cek apakah user sedang login
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.log("Sinkronisasi dibatalkan: User belum login.");
    return { success: false, message: "User belum login" };
  }

  // 2. Ambil semua resep lokal yang is_synced = 0
  const unsyncedRecipes = getUnsyncedRecipes();

  if (unsyncedRecipes.length === 0) {
    console.log("Semua resep sudah tersinkronisasi!");
    return {
      success: true,
      message: "Tidak ada resep baru untuk disinkronisasi.",
    };
  }

  let syncedCount = 0;

  // 3. Looping dan unggah satu per satu
  for (const localRecipe of unsyncedRecipes) {
    try {
      // Ambil detail lengkap beserta bahan dan langkah
      const { ingredients, steps } = getRecipeDetail(localRecipe.id);

      // Siapkan paket data untuk dikirim ke Supabase
      const payload = {
        user_id: user.id,
        local_id: localRecipe.id,
        title: localRecipe.title,
        category: localRecipe.category,
        total_duration_seconds: localRecipe.total_duration_seconds,
        ingredients: ingredients, // Otomatis diubah jadi JSON oleh Supabase
        steps: steps, // Otomatis diubah jadi JSON oleh Supabase
      };

      let cloudIdToSave = localRecipe.cloud_id;

      if (localRecipe.cloud_id) {
        // UPDATE: Jika sudah punya cloud_id, perbarui data yang ada di cloud
        const { error } = await supabase
          .from("recipes")
          .update(payload)
          .eq("id", localRecipe.cloud_id);

        if (error) throw error;
      } else {
        // INSERT: Jika belum punya cloud_id, buat data baru di cloud
        const { data, error } = await supabase
          .from("recipes")
          .insert(payload)
          .select("id")
          .single();

        if (error) throw error;
        cloudIdToSave = data.id;
      }

      // 4. Jika berhasil, tandai di SQLite lokal sebagai 'synced'
      if (cloudIdToSave) {
        markRecipeAsSynced(localRecipe.id, cloudIdToSave);
        syncedCount++;
      }
    } catch (error) {
      console.error(`Gagal menyinkronkan resep ${localRecipe.title}:`, error);
    }
  }

  return {
    success: true,
    message: `Berhasil menyinkronkan ${syncedCount} resep ke cloud.`,
  };
}

export async function importRecipesFromCloud() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "User belum login." };
  }

  const { data: cloudRecipes, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: `Gagal mengambil data: ${error.message}` };
  }

  if (!cloudRecipes || cloudRecipes.length === 0) {
    return { success: true, message: "Tidak ada resep di cloud untuk diimpor." };
  }

  const localRecipes = getAllRecipes();
  const existingCloudIds = new Set(
    localRecipes.filter((r) => r.cloud_id).map((r) => r.cloud_id),
  );

  let importedCount = 0;

  for (const cloudRecipe of cloudRecipes) {
    try {
      if (existingCloudIds.has(cloudRecipe.id)) continue;

      const ingredients = (cloudRecipe.ingredients || []).map((ing: any) => ({
        name: ing.name || "",
        amount: ing.amount || "",
      }));

      const steps = (cloudRecipe.steps || []).map((s: any) => ({
        instruction: s.instruction || "",
        hasTimer: s.has_timer === 1 || s.hasTimer === true,
        durationSeconds: s.duration_seconds || s.durationSeconds || 0,
      }));

      if (ingredients.length === 0) {
        ingredients.push({ name: "Bahan belum tersedia", amount: "-" });
      }
      if (steps.length === 0) {
        steps.push({ instruction: "Langkah belum tersedia", hasTimer: false, durationSeconds: 0 });
      }

      const newId = addRecipe(
        cloudRecipe.title,
        cloudRecipe.category || "Other",
        "",
        ingredients,
        steps,
      );

      markRecipeAsSynced(newId, cloudRecipe.id);
      importedCount++;
    } catch (err) {
      console.error(`Gagal mengimpor resep "${cloudRecipe.title}":`, err);
    }
  }

  return {
    success: true,
    message:
      importedCount > 0
        ? `Berhasil mengimpor ${importedCount} resep dari cloud.`
        : "Semua resep cloud sudah ada di perangkat ini.",
  };
}
