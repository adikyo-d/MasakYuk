import { addRecipe } from "@/database/recipes";
import { getSharedRecipe } from "@/services/share-service";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { ArrowLeft, ClipboardText, Ticket } from "phosphor-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";

const FALLBACK_COVER_IMAGE =
  "https://placehold.co/600x400/FDFBF7/E07A5F?text=Tanpa+Gambar";

// User kadang paste link lengkap ("yourapp://import/K7XQ2P" atau
// "https://domain.com/import/K7XQ2P"), kadang cuma kodenya doang.
// Fungsi ini ekstrak kode mentahnya dari kedua kasus tersebut.
function extractCode(input: string): string {
  const trimmed = input.trim();
  const parts = trimmed.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? trimmed;
}

// Layar ini dibuka dari tombol "Punya Kode Resep?" di Home/Profile —
// buat orang yang dikasih kode share tapi gak tap link-nya langsung
// (mis. karena masih pakai Expo Go, custom scheme belum jalan).
export default function ImportCodeScreen() {
  const [code, setCode] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  const handlePasteFromClipboard = async () => {
    const clipboardText = await Clipboard.getStringAsync();
    if (clipboardText) {
      setCode(extractCode(clipboardText).toUpperCase());
    } else {
      Alert.alert("Clipboard Kosong", "Gak ada teks di clipboard kamu.");
    }
  };

  const handleImport = async () => {
    const cleanCode = extractCode(code).trim();
    if (!cleanCode) {
      Alert.alert("Kode Kosong", "Masukkan kode resep dulu.");
      return;
    }

    try {
      setIsImporting(true);
      const shared = await getSharedRecipe(cleanCode);

      if (!shared) {
        Alert.alert(
          "Kode Tidak Ditemukan",
          "Pastikan kode yang kamu masukkan benar, atau minta kode baru dari pengirim.",
        );
        return;
      }

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
        [{ text: "Lihat Resep", onPress: () => router.replace(`/${newId}`) }],
      );

      setCode("");
    } catch (error) {
      console.error("Gagal import resep dari kode:", error);
      Alert.alert("Gagal", "Terjadi kesalahan saat mengimpor resep.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <View className="flex-1 bg-sketchBg px-5 pt-16">
      <Pressable
        onPress={() => router.back()}
        className="mb-6 w-10 h-10 items-center justify-center"
      >
        <ArrowLeft color="#2F3E46" size={24} weight="bold" />
      </Pressable>

      <View className="mb-6 items-center">
        <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-sketchTerracotta/10">
          <Ticket color="#E07A5F" size={30} weight="duotone" />
        </View>
        <Text className="text-2xl font-bold text-sketchCharcoal">
          Punya Kode Resep?
        </Text>
        <Text className="mt-1 text-center text-sketchMuted px-6">
          Masukkan kode yang dikirim temanmu untuk menambahkan resepnya ke
          koleksimu.
        </Text>
      </View>

      <TextInput
        value={code}
        onChangeText={(v) => setCode(v.toUpperCase())}
        placeholder="Contoh: K7XQ2P"
        placeholderTextColor="#7F8C8D"
        autoCapitalize="characters"
        autoCorrect={false}
        className="mb-3 rounded-xl bg-sketchCard px-4 py-3 text-center text-lg font-bold tracking-widest text-sketchCharcoal"
      />

      <Pressable
        onPress={handlePasteFromClipboard}
        className="mb-4 flex-row items-center justify-center gap-2 rounded-xl border border-dashed border-sketchSage bg-sketchSage/10 py-2.5"
      >
        <ClipboardText color="#81B29A" size={16} weight="bold" />
        <Text className="text-sm font-semibold text-sketchSage">
          Tempel dari Clipboard
        </Text>
      </Pressable>

      <Pressable
        onPress={handleImport}
        disabled={isImporting}
        className={`items-center justify-center rounded-2xl bg-sketchTerracotta py-4 ${
          isImporting ? "opacity-60" : ""
        }`}
      >
        {isImporting ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text className="text-base font-bold text-white">Ambil Resep</Text>
        )}
      </Pressable>
    </View>
  );
}
