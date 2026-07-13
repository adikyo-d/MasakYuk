// Fungsi untuk mengekstrak ID YouTube dari sebuah link
const extractYoutubeId = (url: string) => {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/,
  );
  return match ? match[1] : url; // Jika gagal regex, asumsikan string itu sudah berupa ID
};

export const generateRecipeFromYoutube = async (youtubeLink: string) => {
  try {
    // 1. Ekstrak Video ID dari link yang dimasukkan
    const videoId = extractYoutubeId(youtubeLink);

    if (!videoId) {
      throw new Error("Link YouTube tidak valid. Pastikan format link benar.");
    }

    // 2. Ambil URL Vercel dari file .env
    const apiUrl = process.env.EXPO_PUBLIC_RENDER_API_URL;

    if (!apiUrl) {
      throw new Error("Sistem belum siap: URL API (.env) belum ditemukan.");
    }

    // (Opsional) Cetak di terminal VS Code agar mudah di-debug
    console.log("🚀 Menghubungi API:", `${apiUrl}/api/generate-recipe`);
    console.log("🎬 Video ID:", videoId);

    // 3. Panggil backend
    const response = await fetch(`${apiUrl}/api/generate-recipe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        videoId: videoId,
        videoUrl: youtubeLink,
      }),
    });

    // 4. Tangkap error secara cerdas (termasuk Error 400)
    if (!response.ok) {
      let errorMessage = `Server error: ${response.status}`;
      try {
        // Coba baca pesan error bahasa Indonesia dari server.js
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // Abaikan jika backend tidak mengembalikan format JSON
      }
      throw new Error(errorMessage); // Lempar error agar ditangkap oleh komponen UI
    }

    // 5. Kembalikan data resep jika sukses
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("❌ Error di ai-service:", error.message);
    throw error;
  }
};
