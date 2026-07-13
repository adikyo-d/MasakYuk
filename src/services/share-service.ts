import { supabase } from "@/lib/supabase";

export type SharedIngredient = { name: string; amount: string };
export type SharedStep = {
  instruction: string;
  hasTimer: boolean;
  durationSeconds: number;
};

export type SharedRecipePayload = {
  title: string;
  category: string;
  cover_image: string | null;
  video_url: string | null;
  ingredients: SharedIngredient[];
  steps: SharedStep[];
};

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // tanpa 0/O/1/I biar ga ambigu dibaca

function generateCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

/**
 * Upload resep ke Supabase dan hasilkan kode share pendek (mis. "K7XQ2P").
 * Retry sekali kalau ternyata kode-nya sudah dipakai (jarang terjadi, tapi tetap dijaga).
 */
export async function shareRecipe(
  payload: SharedRecipePayload,
): Promise<string> {
  // Wajib login — sesuai kebijakan RLS: cuma user yang login yang boleh
  // generate share code (mencegah spam dari anon).
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("Kamu harus login dulu untuk membagikan resep.");
  }

  // 🚫 Sengaja TIDAK upload gambar lokal ke Storage (hemat kuota).
  // Kalau cover_image berupa file lokal (hasil gambar poster di kanvas),
  // dilewatin aja — penerima bakal dapat resep tanpa gambar dan bisa
  // gambar ulang poster sendiri. Kalau sudah remote URL (mis. thumbnail
  // YouTube), itu aman dipakai apa adanya karena cuma nyimpen teks link.
  const isRemoteImage =
    !!payload.cover_image &&
    (payload.cover_image.startsWith("http://") ||
      payload.cover_image.startsWith("https://"));

  const uploadPayload: SharedRecipePayload = {
    ...payload,
    cover_image: isRemoteImage ? payload.cover_image : null,
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateCode();

    const { error } = await supabase
      .from("shared_recipes")
      .insert({ code, user_id: userData.user.id, data: uploadPayload });

    if (!error) return code;

    // 23505 = unique_violation di Postgres -> kode bentrok, coba lagi
    if ((error as any).code !== "23505") {
      throw error;
    }
  }

  throw new Error("Gagal membuat kode share, coba lagi.");
}

/**
 * Ambil data resep dari kode share. Return null kalau kode tidak ditemukan.
 */
export async function getSharedRecipe(
  code: string,
): Promise<SharedRecipePayload | null> {
  const { data, error } = await supabase
    .from("shared_recipes")
    .select("data")
    .eq("code", code.trim().toUpperCase())
    .single();

  if (error || !data) return null;
  return data.data as SharedRecipePayload;
}
