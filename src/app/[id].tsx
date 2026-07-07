import IngredientRow from "@/components/ingredient-row";
import StepPreviewRow from "@/components/step-preview-row";
import { isFavorite, toggleFavorite } from "@/database/favorites";
import { getRecipeDetail } from "@/database/recipes";
import { formatDuration } from "@/utils/format-duration";
import { BlurView } from "expo-blur";
import { router, useLocalSearchParams } from "expo-router";
import { CaretLeft, Clock, CookingPot, Heart } from "phosphor-react-native";
import { useState } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

type Tab = "bahan" | "langkah";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipeId = Number(id);

  const { recipe, ingredients, steps } = getRecipeDetail(recipeId);
  const [activeTab, setActiveTab] = useState<Tab>("bahan");
  const [favorited, setFavorited] = useState(() => isFavorite(recipeId));

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

  return (
    <View className="flex-1 bg-sketchBg">
      {/* HERO SECTION */}
      <View style={{ height: "38%" }}>
        <Image
          source={{ uri: recipe.cover_image }}
          className="w-full h-full"
          resizeMode="cover"
        />

        <Pressable
          onPress={() => router.back()}
          className="absolute top-14 left-4 w-10 h-10 rounded-full overflow-hidden"
        >
          <BlurView
            intensity={40}
            tint="light"
            className="w-full h-full items-center justify-center"
          >
            <CaretLeft color="#2F3E46" size={20} weight="bold" />
          </BlurView>
        </Pressable>

        <Pressable
          onPress={handleToggleFavorite}
          className="absolute top-14 right-4 w-10 h-10 rounded-full overflow-hidden"
        >
          <BlurView
            intensity={40}
            tint="light"
            className="w-full h-full items-center justify-center"
          >
            <Heart
              color={favorited ? "#E07A5F" : "#2F3E46"}
              size={20}
              weight={favorited ? "fill" : "regular"}
            />
          </BlurView>
        </Pressable>
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
        </View>

        {/* TAB SWITCHER */}
        <View className="flex-row bg-sketchBg rounded-2xl p-1 mb-3">
          <Pressable
            onPress={() => setActiveTab("bahan")}
            className={`flex-1 py-2 rounded-xl items-center ${
              activeTab === "bahan" ? "bg-sketchCard shadow-sm" : ""
            }`}
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
              activeTab === "langkah" ? "bg-sketchCard shadow-sm" : ""
            }`}
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
          className="flex-row items-center justify-center gap-2 bg-sketchTerracotta rounded-2xl py-4 shadow-lg"
        >
          <CookingPot color="#FFFFFF" size={20} weight="duotone" />
          <Text className="text-white font-bold text-base">Mulai Memasak</Text>
        </Pressable>
      </View>
    </View>
  );
}
