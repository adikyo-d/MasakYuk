import ChefAIModal from "@/components/chef-ai-modal";
import IngredientRow from "@/components/ingredient-row";
import StepPreviewRow from "@/components/step-preview-row";
import YoutubePlayer from "@/components/youtube-player";
import { isFavorite, toggleFavorite } from "@/database/favorites";
import { deleteRecipe, getRecipeDetail } from "@/database/recipes";
import { shareRecipe } from "@/services/share-service";
import { formatDuration } from "@/utils/format-duration";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
    CaretLeft,
    Clock,
    CookingPot,
    Heart,
    PencilSimple,
    Play,
    ShareNetwork,
    Sparkle,
    Trash,
} from "phosphor-react-native";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    Share as RNShare,
    ScrollView,
    Text,
    View,
} from "react-native";

type Tab = "bahan" | "langkah";

// Satu style shadow dipakai bareng semua tombol aksi bulat[cite: 12]
const actionButtonShadow = {
  elevation: 3,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.12,
  shadowRadius: 4,
};

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipeId = Number(id);

  const [data, setData] = useState(() => getRecipeDetail(recipeId));
  const [activeTab, setActiveTab] = useState<Tab>("bahan");
  const [favorited, setFavorited] = useState(() => isFavorite(recipeId));
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  //  State untuk mengontrol kemunculan Modal Chef AI
  const [showChefAI, setShowChefAI] = useState(false);

  useEffect(() => {
    setData(getRecipeDetail(recipeId));
    setFavorited(isFavorite(recipeId));
    setActiveTab("bahan");
    setIsPlayingVideo(false);
  }, [recipeId]);

  useFocusEffect(
    useCallback(() => {
      setData(getRecipeDetail(recipeId));
      setFavorited(isFavorite(recipeId));
    }, [recipeId]),
  );

  const { recipe, ingredients, steps } = data;

  if (!recipe) {
    return (
      <View className="flex-1 bg-sketchBg items-center justify-center px-4">
        <View className="items-center rounded-2xl bg-sketchCard p-8">
          <CookingPot color="#E07A5F" size={44} weight="duotone" />
          <Text className="mt-4 text-center text-base font-semibold text-sketchCharcoal">
            Resep tidak ditemukan
          </Text>
        </View>
      </View>
    );
  }

  const handleToggleFavorite = () => {
    Haptics.selectionAsync();
    toggleFavorite(recipeId);
    setFavorited(!favorited);
  };

  const handleDeleteRecipe = () => {
    Alert.alert(
      "Buang Resep? 🗑️",
      "Apakah kamu yakin ingin menghapus resep ini dari laci dapurmu? Tindakan ini tidak bisa dibatalkan.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => {
            deleteRecipe(recipeId);
            router.back();
          },
        },
      ],
    );
  };

  const handleShareRecipe = async () => {
    try {
      setIsSharing(true);
      Haptics.selectionAsync();

      const code = await shareRecipe({
        title: recipe.title,
        category: recipe.category,
        cover_image: recipe.cover_image ?? null,
        video_url: recipe.video_url ?? null,
        ingredients: ingredients.map((ing: any) => ({
          name: ing.name,
          amount: ing.amount,
        })),
        steps: steps.map((s: any) => ({
          instruction: s.instruction,
          hasTimer: s.has_timer === 1,
          durationSeconds: s.duration_seconds,
        })),
      });

      const link = `masakyuk://import/${code}`;
      await Clipboard.setStringAsync(link);

      Alert.alert(
        "Resep Siap Dibagikan! 🎉",
        `Kode: ${code}\n\nLink import sudah disalin ke clipboard.`,
        [
          { text: "Tutup", style: "cancel" },
          {
            text: "Bagikan",
            onPress: () =>
              RNShare.share({
                message: `Cobain resep "${recipe.title}" dari dapurku! ${link}\n\nAtau masukkan kode: ${code}`,
              }),
          },
        ],
      );
    } catch (error: any) {
      console.error("Gagal share resep:", error);
      Alert.alert(
        "Gagal Membagikan",
        error?.message ??
          "Tidak bisa membagikan resep sekarang. Coba lagi nanti.",
      );
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <View className="flex-1 bg-sketchBg">
      {/* HERO SECTION */}
      <View style={{ height: "38%" }}>
        {isPlayingVideo && recipe.video_url ? (
          <View className="flex-1 bg-black justify-center">
            <YoutubePlayer url={recipe.video_url} height={280} />
            <Pressable
              onPress={() => setIsPlayingVideo(false)}
              className="absolute top-14 right-4 bg-white/20 px-3 py-1 rounded-full"
            >
              <Text className="text-white text-xs font-bold">Tutup Video</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Image
              source={{ uri: recipe.cover_image || "" }}
              className="w-full h-full"
              resizeMode="cover"
            />
            {recipe.video_url && (
              <Pressable
                onPress={() => setIsPlayingVideo(true)}
                className="absolute inset-0 items-center justify-center bg-black/10"
              >
                <View className="w-16 h-16 rounded-full bg-sketchTerracotta items-center justify-center shadow-xl">
                  <Play color="#FFFFFF" size={32} weight="fill" />
                </View>
              </Pressable>
            )}
          </>
        )}

        {/* Tombol Kembali (Kiri) */}
        <Pressable
          onPress={() => router.back()}
          className="absolute top-14 left-4 w-11 h-11 rounded-full bg-white/90 items-center justify-center"
          style={actionButtonShadow}
        >
          <CaretLeft color="#2F3E46" size={24} weight="bold" />
        </Pressable>

        {/* Kumpulan Tombol Aksi (Kanan) */}
        <View className="absolute top-14 right-4 flex-row gap-2.5">
          {/* Tombol Share */}
          <Pressable
            onPress={handleShareRecipe}
            disabled={isSharing}
            style={({ pressed }) => [
              actionButtonShadow,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            className="w-11 h-11 rounded-full bg-white/90 items-center justify-center"
          >
            {isSharing ? (
              <ActivityIndicator color="#E07A5F" size="small" />
            ) : (
              <ShareNetwork color="#2F3E46" size={21} weight="bold" />
            )}
          </Pressable>

          {/* Tombol Edit */}
          <Pressable
            onPress={() => router.push(`/edit/${recipeId}`)}
            style={({ pressed }) => [
              actionButtonShadow,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            className="w-11 h-11 rounded-full bg-white/90 items-center justify-center"
          >
            <PencilSimple color="#2F3E46" size={21} weight="bold" />
          </Pressable>

          {/* Tombol Hapus */}
          <Pressable
            onPress={handleDeleteRecipe}
            style={({ pressed }) => [
              actionButtonShadow,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            className="w-11 h-11 rounded-full bg-white/90 items-center justify-center"
          >
            <Trash color="#E07A5F" size={21} weight="bold" />
          </Pressable>

          {/* Tombol Favorit */}
          <Pressable
            onPress={handleToggleFavorite}
            style={({ pressed }) => [
              actionButtonShadow,
              { opacity: pressed ? 0.85 : 1 },
            ]}
            className="w-11 h-11 rounded-full bg-white/90 items-center justify-center"
          >
            <Heart
              color={favorited ? "#E07A5F" : "#2F3E46"}
              size={21}
              weight={favorited ? "fill" : "bold"}
            />
          </Pressable>
        </View>
      </View>

      {/* WHITE SHEET — Header Info */}
      <View className="flex-1 bg-sketchCard rounded-t-3xl -mt-6 px-5 pt-6">
        <Text className="text-2xl font-bold text-sketchCharcoal">
          {recipe.title}
        </Text>

        <View className="flex-row items-center mt-3 mb-4">
          <View className="bg-sketchTerracotta rounded-full px-3 py-1 mr-2">
            <Text className="text-white text-xs font-semibold">
              {recipe.category}
            </Text>
          </View>
          <View className="flex-row items-center bg-sketchSage rounded-full px-3 py-1">
            <Clock color="#FFFFFF" size={12} weight="bold" />
            <Text className="text-white text-xs font-semibold ml-1">
              {formatDuration(recipe.total_duration_seconds)}
            </Text>
          </View>
          {(recipe.cook_count ?? 0) > 0 && (
            <View className="flex-row items-center bg-sketchCharcoal/80 rounded-full px-3 py-1 ml-2">
              <CookingPot color="#FFFFFF" size={12} weight="fill" />
              <Text className="text-white text-xs font-semibold ml-1">
                Cooked {recipe.cook_count}x
              </Text>
            </View>
          )}
        </View>

        {/* TAB SWITCHER */}
        <View className="flex-row bg-sketchBg rounded-2xl p-1 mb-3">
          <Pressable
            onPress={() => setActiveTab("bahan")}
            className={`flex-1 py-2 rounded-xl items-center ${
              activeTab === "bahan" ? "bg-sketchCard" : ""
            }`}
            style={
              activeTab === "bahan"
                ? {
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                  }
                : undefined
            }
          >
            <Text
              className={
                activeTab === "bahan"
                  ? "text-sketchCharcoal font-semibold"
                  : "text-sketchMuted"
              }
            >
              Bahan-Bahan
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab("langkah")}
            className={`flex-1 py-2 rounded-xl items-center ${
              activeTab === "langkah" ? "bg-sketchCard" : ""
            }`}
            style={
              activeTab === "langkah"
                ? {
                    elevation: 2,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                  }
                : undefined
            }
          >
            <Text
              className={
                activeTab === "langkah"
                  ? "text-sketchCharcoal font-semibold"
                  : "text-sketchMuted"
              }
            >
              Langkah Memasak
            </Text>
          </Pressable>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* 🚀 TOMBOL PEMANGGIL CHEF AI */}
          <Pressable
            onPress={() => setShowChefAI(true)}
            className="mb-4 mt-2 flex-row items-center justify-center gap-2 rounded-2xl border border-sketchTerracotta bg-sketchTerracotta/10 py-3 shadow-sm"
          >
            <Sparkle color="#E07A5F" size={20} weight="fill" />
            <Text className="text-base font-bold text-sketchTerracotta">
              Tanya Chef AI
            </Text>
          </Pressable>

          {activeTab === "bahan"
            ? ingredients.map((ing: any) => (
                <IngredientRow
                  key={ing.id}
                  name={ing.name}
                  amount={ing.amount}
                />
              ))
            : steps.map((step: any) => (
                <StepPreviewRow
                  key={step.id}
                  order={step.step_order}
                  instruction={step.instruction}
                  hasTimer={step.has_timer === 1}
                  durationSeconds={step.duration_seconds}
                />
              ))}
          <View className="h-24" />
        </ScrollView>
      </View>

      {/* FLOATING ACTION BUTTON */}
      <View className="absolute bottom-6 left-5 right-5">
        <Pressable
          onPress={() => router.push(`/masak/${recipeId}`)}
          className="flex-row items-center justify-center gap-2 bg-sketchTerracotta rounded-2xl py-4"
          style={{
            elevation: 5,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
          }}
        >
          <CookingPot color="#FFFFFF" size={20} weight="duotone" />
          <Text className="text-white font-bold text-base">Mulai Memasak</Text>
        </Pressable>
      </View>

      {/* 🚀 KOMPONEN MODAL CHEF AI */}
      <ChefAIModal
        visible={showChefAI}
        onClose={() => setShowChefAI(false)}
        recipeName={recipe.title}
      />
    </View>
  );
}
