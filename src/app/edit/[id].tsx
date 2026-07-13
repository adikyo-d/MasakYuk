import IngredientInputRow from "@/components/ingredient-input-row";
import RecipePosterCanvas from "@/components/recipe-poster-canvas";
import StepInputCard from "@/components/step-input-card";
import YoutubePlayer from "@/components/youtube-player";
import { getRecipeDetail, updateRecipe } from "@/database/recipes";
import { extractYoutubeId } from "@/utils/youtube";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { CaretLeft, FloppyDisk, NotePencil, Play, Plus, YoutubeLogo } from "phosphor-react-native";
import { useEffect, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

const CATEGORIES = [
  "Main Course",
  "Side Dish",
  "Dessert",
  "Drink",
  "Snack",
  "Soup",
  "Other",
];

type IngredientDraft = { id: string; name: string; amount: string };
type StepDraft = {
  id: string;
  instruction: string;
  hasTimer: boolean;
  durationSeconds: string;
};

export default function EditRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipeId = Number(id);

  const [isReady, setIsReady] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [posterUri, setPosterUri] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [showPreviewVideo, setShowPreviewVideo] = useState(false);
  const [ingredients, setIngredients] = useState<IngredientDraft[]>([]);
  const [steps, setSteps] = useState<StepDraft[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const data = getRecipeDetail(recipeId);
    if (data && data.recipe) {
      setTitle(data.recipe.title);
      setCategory(data.recipe.category);
      setPosterUri(data.recipe.cover_image);
      setVideoUrl(data.recipe.video_url || "");

      if (data.ingredients.length > 0) {
        setIngredients(
          data.ingredients.map((ing: any) => ({
            id: ing.id.toString(),
            name: ing.name,
            amount: ing.amount,
          })),
        );
      }

      if (data.steps.length > 0) {
        setSteps(
          data.steps.map((s: any) => ({
            id: s.id.toString(),
            instruction: s.instruction,
            hasTimer: s.has_timer === 1,
            durationSeconds: s.duration_seconds
              ? s.duration_seconds.toString()
              : "",
          })),
        );
      }
      setIsReady(true);
    }
  }, [recipeId]);

  const updateIngredient = (
    id: string,
    field: "name" | "amount",
    value: string,
  ) => {
    setIngredients((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing)),
    );
  };

  const addIngredientRow = () => {
    setIngredients((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", amount: "" },
    ]);
  };

  const removeIngredientRow = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
  };

  const updateStep = (id: string, updates: Partial<StepDraft>) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    );
  };

  const addStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        instruction: "",
        hasTimer: false,
        durationSeconds: "",
      },
    ]);
  };

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = () => {
    if (!posterUri || !title.trim() || !category) {
      Alert.alert("Belum Lengkap", "Pastikan semua data terisi.");
      return;
    }

    try {
      setIsSaving(true);
      updateRecipe(
        recipeId,
        title.trim(),
        category,
        posterUri,
        ingredients
          .filter((i) => i.name.trim())
          .map((i) => ({ name: i.name.trim(), amount: i.amount.trim() })),
        steps
          .filter((s) => s.instruction.trim())
          .map((s) => ({
            instruction: s.instruction.trim(),
            hasTimer: s.hasTimer,
            durationSeconds: s.hasTimer
              ? parseInt(s.durationSeconds || "0", 10)
              : 0,
          })),
        videoUrl.trim() || null,
      );
      Alert.alert("Berhasil", "Resep berhasil diperbarui!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isReady) {
    return (
      <View className="flex-1 bg-sketchBg items-center justify-center">
        <Text className="text-sketchCharcoal font-bold">
          Menyiapkan Laci Dapur...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-sketchBg">
      <ScrollView
        className="flex-1 px-4 pt-14"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="flex-row items-center mb-5">
          <Pressable
            onPress={() => router.back()}
            className="mr-3 bg-white p-2 rounded-full shadow-sm"
          >
            <CaretLeft color="#2F3E46" size={24} weight="bold" />
          </Pressable>
          <NotePencil color="#2F3E46" size={24} weight="bold" />
          <Text className="text-2xl font-bold text-sketchCharcoal ml-2">
            Edit Resep
          </Text>
        </View>

        <View className="relative">
          <RecipePosterCanvas
            initialUri={posterUri}
            onPosterSaved={(uri) => setPosterUri(uri)}
          />
          {posterUri && videoUrl && extractYoutubeId(videoUrl) && (
            <Pressable
              onPress={() => setShowPreviewVideo(true)}
              className="absolute bottom-4 right-4 bg-sketchTerracotta w-12 h-12 rounded-full items-center justify-center shadow-lg"
            >
              <Play color="#FFFFFF" size={24} weight="fill" />
            </Pressable>
          )}
          {showPreviewVideo && videoUrl && (
            <View className="absolute inset-0 bg-black/90 rounded-3xl overflow-hidden justify-center">
              <YoutubePlayer url={videoUrl} />
              <Pressable
                onPress={() => setShowPreviewVideo(false)}
                className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full"
              >
                <Text className="text-white text-xs font-bold">Tutup Video</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View className="bg-sketchCard rounded-2xl p-4 mb-4 mt-2">
          <Text className="text-sketchMuted text-md mb-1">Name</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            className="text-sketchCharcoal text-base border-b border-gray-100 pb-2 mb-4"
          />

          <View className="mb-4">
            <View className="flex-row items-center gap-2 mb-1">
              <YoutubeLogo color="#E07A5F" size={18} weight="duotone" />
              <Text className="text-sketchMuted text-md font-medium">
                Link Video YouTube (Opsional)
              </Text>
            </View>
            <TextInput
              value={videoUrl}
              onChangeText={setVideoUrl}
              placeholder="https://youtube.com/watch?v=..."
              placeholderTextColor="#7F8C8D"
              className="text-sketchCharcoal text-base border-b border-gray-100 pb-2"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <Text className="text-sketchMuted text-md mb-2">Categories</Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                className={`px-5 py-2 rounded-full border ${category === cat ? "bg-sketchTerracotta border-sketchTerracotta" : "border-gray-300"}`}
              >
                <Text
                  className={
                    category === cat
                      ? "text-white font-semibold"
                      : "text-sketchMuted"
                  }
                >
                  {cat}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="bg-sketchCard rounded-2xl border-[0.5px] p-4 mb-4">
          <Text className="text-sketchCharcoal font-bold mb-3">
            Bahan-Bahan
          </Text>
          {ingredients.map((ing) => (
            <IngredientInputRow
              key={ing.id}
              name={ing.name}
              amount={ing.amount}
              onChangeName={(v) => updateIngredient(ing.id, "name", v)}
              onChangeAmount={(v) => updateIngredient(ing.id, "amount", v)}
              onRemove={() => removeIngredientRow(ing.id)}
            />
          ))}
          <Pressable
            onPress={addIngredientRow}
            className="flex-row items-center gap-1 mt-2"
          >
            <Plus color="#81B29A" size={16} weight="bold" />
            <Text className="text-sketchSage font-semibold text-md">
              Tambah Bahan
            </Text>
          </Pressable>
        </View>

        <Text className="text-sketchCharcoal font-bold mb-3">
          Langkah Memasak
        </Text>
        {steps.map((step, index) => (
          <StepInputCard
            key={step.id}
            order={index + 1}
            instruction={step.instruction}
            hasTimer={step.hasTimer}
            durationSeconds={step.durationSeconds}
            onChangeInstruction={(v) => updateStep(step.id, { instruction: v })}
            onToggleTimer={(v) => updateStep(step.id, { hasTimer: v })}
            onChangeDuration={(v) =>
              updateStep(step.id, { durationSeconds: v })
            }
            onRemove={() => removeStep(step.id)}
          />
        ))}
        <Pressable
          onPress={addStep}
          className="flex-row items-center gap-1 mb-10"
        >
          <Plus color="#81B29A" size={16} weight="bold" />
          <Text className="text-sketchSage font-semibold text-md">
            Tambah Langkah
          </Text>
        </Pressable>
      </ScrollView>

      <LinearGradient
        colors={["transparent", "#FDFBF7"]}
        className="absolute bottom-0 left-0 right-0 h-24 px-4 justify-end pb-6"
        pointerEvents="box-none"
      >
        <Pressable
          onPress={handleSubmit}
          disabled={isSaving}
          className={`flex-row items-center justify-center gap-2 bg-sketchTerracotta rounded-2xl py-4 ${isSaving ? "opacity-60" : ""}`}
        >
          <FloppyDisk color="#FFFFFF" size={20} weight="bold" />
          <Text className="text-white font-bold text-base">
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}
