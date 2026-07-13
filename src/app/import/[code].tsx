import { addRecipe } from "@/database/recipes";
import { getSharedRecipe } from "@/services/share-service";
import { router, useLocalSearchParams } from "expo-router";
import { CookingPot } from "phosphor-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";

// Dipakai kalau resep yang di-share gak punya gambar remote
// (poster gambar-tangan lokal sengaja gak diikutkan biar hemat storage).
const FALLBACK_COVER_IMAGE =
  "https://placehold.co/600x400/FDFBF7/E07A5F?text=Tanpa+Gambar";

// Route ini kepanggil saat user buka deep link `yourapp://import/CODE`
// (mis. dari link yang dishare lewat WA/tombol Share).
export default function ImportRecipeScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!code) {
        setStatus("error");
        return;
      }

      const shared = await getSharedRecipe(code);

      if (cancelled) return;

      if (!shared) {
        setStatus("error");
        return;
      }

      try {
        const newId = addRecipe(
          shared.title,
          shared.category,
          shared.cover_image ?? FALLBACK_COVER_IMAGE,
          shared.ingredients,
          shared.steps,
          undefined,
          shared.video_url ?? undefined,
        );

        const missingImage = !shared.cover_image;

        Alert.alert(
          "Resep Ditambahkan! 🎉",
          missingImage
            ? `"${shared.title}" berhasil masuk ke koleksimu. Resep ini gak punya gambar poster — kamu bisa gambar sendiri lewat tombol edit.`
            : `"${shared.title}" berhasil masuk ke koleksimu.`,
          [
            {
              text: "Lihat Resep",
              onPress: () => router.replace(`/${newId}`),
            },
          ],
        );
      } catch (error) {
        console.error("Gagal import resep:", error);
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code]);

  if (status === "error") {
    return (
      <View className="flex-1 items-center justify-center bg-sketchBg px-6">
        <CookingPot color="#E07A5F" size={40} weight="duotone" />
        <Text className="mt-4 text-center text-base font-semibold text-sketchCharcoal">
          Kode resep tidak ditemukan
        </Text>
        <Text className="mt-1 text-center text-sm text-sketchMuted">
          Kode mungkin salah ketik atau resepnya sudah tidak tersedia.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-sketchBg">
      <ActivityIndicator color="#E07A5F" />
      <Text className="mt-3 text-sketchMuted">Mengimpor resep...</Text>
    </View>
  );
}
