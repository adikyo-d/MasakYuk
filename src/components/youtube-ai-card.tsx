import { addRecipe } from "@/database/recipes";
import { generateRecipeFromYoutube } from "@/services/ai-service";
import { extractYoutubeId, getYoutubeThumbnail } from "@/utils/youtube";
import { router } from "expo-router";
import { Play, Sparkle, YoutubeLogo } from "phosphor-react-native";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";

export default function YoutubeAiCard() {
  const [link, setLink] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const videoId = useMemo(() => extractYoutubeId(link), [link]);

  const handleGenerate = async () => {
    if (!videoId) {
      Alert.alert("Link Tidak Valid", "Pastikan link YouTube sudah benar.");
      return;
    }

    try {
      setIsGenerating(true);
      const recipe = await generateRecipeFromYoutube(videoId, link);

      // 🚀 Solusi paling jitu: Langsung gunakan thumbnail YouTube sebagai sampul resep!
      const coverImageUri = getYoutubeThumbnail(videoId);

      const newRecipeId = addRecipe(
        recipe.title,
        recipe.category,
        coverImageUri,
        recipe.ingredients,
        recipe.steps.map((s) => ({
          instruction: s.instruction,
          hasTimer: s.hasTimer,
          durationSeconds: s.hasTimer ? s.durationSeconds : 0,
        })),
        undefined,
        link,
      );

      setLink("");
      Alert.alert(
        "Resep Berhasil Dibuat!",
        `"${recipe.title}" berhasil dibuat dari video. Cek dan sesuaikan kalau perlu.`,
        [
          {
            text: "Lihat Resep",
            onPress: () => router.push(`/${newRecipeId}`),
          },
        ],
      );
    } catch (error) {
      console.error(error);
      Alert.alert(
        "Gagal",
        "Tidak bisa membuat resep dari video ini. Coba video lain atau isi manual di tab Tambah.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View
      className="rounded-2xl bg-sketchCard p-4"
      style={{
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      }}
    >
      <View className="mb-1 flex-row items-center gap-2">
        <YoutubeLogo color="#E07A5F" size={22} weight="duotone" />
        <Text className="text-base font-bold text-sketchCharcoal">
          Generate dari YouTube
        </Text>
      </View>
      <Text className="mb-3 text-xs text-sketchMuted">
        Tempel link resep masak di YouTube, biar AI yang susunkan bahan &
        langkahnya.
      </Text>

      <TextInput
        value={link}
        onChangeText={setLink}
        placeholder="https://youtube.com/watch?v=..."
        placeholderTextColor="#7F8C8D"
        className="mb-3 rounded-xl bg-sketchBg px-3 py-2.5 text-sketchCharcoal"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />

      {videoId && (
        <View className="mb-3 overflow-hidden rounded-xl">
          <Image
            source={{ uri: getYoutubeThumbnail(videoId) }}
            className="h-48 w-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 items-center justify-center">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-black/50">
              <Play color="#FFFFFF" size={22} weight="fill" />
            </View>
          </View>
        </View>
      )}

      {videoId && (
        <Pressable
          onPress={handleGenerate}
          disabled={isGenerating}
          className={`flex-row items-center justify-center gap-2 rounded-xl bg-sketchTerracotta py-3 ${
            isGenerating ? "opacity-60" : ""
          }`}
        >
          {isGenerating ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Sparkle color="#FFFFFF" size={18} weight="fill" />
          )}
          <Text className="font-bold text-white">
            {isGenerating ? "Menganalisis video..." : "Generate Resep"}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
