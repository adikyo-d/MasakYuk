import IngredientRow from "@/components/ingredient-row";
import StepPreviewRow from "@/components/step-preview-row";
import { isFavorite, toggleFavorite } from "@/database/favorites";
import { deleteRecipe, getRecipeDetail } from "@/database/recipes"; // 👈 Tambahkan deleteRecipe
import { formatDuration } from "@/utils/format-duration";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
    CaretLeft,
    Clock,
    CookingPot,
    Heart, // 👈 Import ikon Trash
    PencilSimple,
    Trash, // 👈 Import ikon Trash
} from "phosphor-react-native";
import { useCallback, useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native"; // 👈 Import Alert

type Tab = "bahan" | "langkah";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipeId = Number(id);

  const [data, setData] = useState(() => getRecipeDetail(recipeId));
  const [activeTab, setActiveTab] = useState<Tab>("bahan");
  const [favorited, setFavorited] = useState(() => isFavorite(recipeId));

  // Reset semua state saat recipeId berubah (buka resep berbeda)
  useEffect(() => {
    setData(getRecipeDetail(recipeId));
    setFavorited(isFavorite(recipeId));
    setActiveTab("bahan");
  }, [recipeId]);

  // Refresh data saat kembali ke layar ini (misal dari mode masak)
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
    toggleFavorite(recipeId);
    setFavorited(!favorited);
  };

  // 🚀 Fungsi Konfirmasi & Hapus Resep
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
            router.back(); // Kembali ke halaman sebelumnya setelah dihapus
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-sketchBg">
      {/* HERO SECTION */}
      <View style={{ height: "38%" }}>
        <Image
          source={{ uri: recipe.cover_image }}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Tombol Kembali (Kiri) */}
        <Pressable
          onPress={() => router.back()}
          className="absolute top-14 left-4 w-11 h-11 rounded-full bg-white/90 items-center justify-center"
          style={{
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          }}
        >
          <CaretLeft color="#2F3E46" size={24} weight="bold" />
        </Pressable>

        {/* 🚀 Kumpulan Tombol Aksi (Kanan) */}
        <View className="absolute top-14 right-4 flex-row gap-3">
          {/* Tombol Edit */}
          <Pressable
            onPress={() => router.push(`/edit/${recipeId}`)} // Pastikan rute ini nanti dibuat ya!
            className="w-11 h-11 rounded-full bg-white/90 items-center justify-center"
            style={{
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }}
          >
            <PencilSimple color="#2F3E46" size={22} weight="bold" />
          </Pressable>

          {/* Tombol Hapus */}
          <Pressable
            onPress={handleDeleteRecipe}
            className="w-11 h-11 rounded-full bg-white/90 items-center justify-center"
            style={{
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }}
          >
            <Trash color="#E07A5F" size={22} weight="bold" />
          </Pressable>

          {/* Tombol Favorit */}
          <Pressable
            onPress={handleToggleFavorite}
            className="w-11 h-11 rounded-full bg-white/90 items-center justify-center"
            style={{
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }}
          >
            <Heart
              color={favorited ? "#E07A5F" : "#2F3E46"}
              size={22}
              weight={favorited ? "fill" : "bold"} // Menggunakan 'bold' saat tidak aktif agar serasi dengan ikon lain
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
    </View>
  );
}
