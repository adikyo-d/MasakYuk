import IngredientInputRow from "@/components/ingredient-input-row";
import RecipePosterCanvas from "@/components/recipe-poster-canvas";
import StepInputCard from "@/components/step-input-card";
import { getProfile } from "@/database/profile";
import { addRecipe } from "@/database/recipes";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { FloppyDisk, NotePencil, Plus } from "phosphor-react-native";
import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Image,
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

// 🚀 KOMPONEN ANIMASI KETIK (TYPEWRITER)
const TypewriterText = ({
  text,
  delay = 60,
}: {
  text: string;
  delay?: number;
}) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayedText("");
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, delay);
    return () => clearInterval(timer);
  }, [text, delay]);

  return (
    <Text className="text-xl font-bold text-sketchCharcoal">
      {displayedText}
    </Text>
  );
};

export default function TambahResepScreen() {
  // === Sapaan Personal ===
  const [chefName, setChefName] = useState("Adit");

  // === Metadata ===
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [posterUri, setPosterUri] = useState<string | null>(null);

  // === Bahan-bahan ===
  const [ingredients, setIngredients] = useState<IngredientDraft[]>([
    { id: Date.now().toString(), name: "", amount: "" },
  ]);

  // === Langkah-langkah ===
  const [steps, setSteps] = useState<StepDraft[]>([
    {
      id: (Date.now() + 1).toString(),
      instruction: "",
      hasTimer: false,
      durationSeconds: "",
    },
  ]);

  const [isSaving, setIsSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      try {
        const profile = getProfile();
        if (profile && profile.name) {
          setChefName(profile.name);
        }
      } catch (error) {
        console.error("Gagal memuat profil:", error);
      }
    }, []),
  );

  // --- Handler Bahan ---
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

  // --- Handler Langkah ---
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

  // --- Validasi & Submit ---
  const handleSubmit = () => {
    if (!posterUri) {
      Alert.alert("Belum Lengkap", "Unggah dan gambar poster resep dulu.");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Belum Lengkap", "Nama masakan wajib diisi.");
      return;
    }
    if (!category) {
      Alert.alert("Belum Lengkap", "Pilih kategori resep dulu.");
      return;
    }

    const validIngredients = ingredients.filter(
      (ing) => ing.name.trim() !== "",
    );
    if (validIngredients.length === 0) {
      Alert.alert("Belum Lengkap", "Tambahkan minimal 1 bahan.");
      return;
    }

    const validSteps = steps.filter((s) => s.instruction.trim() !== "");
    if (validSteps.length === 0) {
      Alert.alert("Belum Lengkap", "Tambahkan minimal 1 langkah memasak.");
      return;
    }

    try {
      setIsSaving(true);
      addRecipe(
        title.trim(),
        category,
        posterUri,
        validIngredients.map((ing) => ({
          name: ing.name.trim(),
          amount: ing.amount.trim(),
        })),
        validSteps.map((s) => ({
          instruction: s.instruction.trim(),
          hasTimer: s.hasTimer,
          durationSeconds: s.hasTimer
            ? parseInt(s.durationSeconds || "0", 10)
            : 0,
        })),
      );

      Alert.alert("Berhasil", "Resep berhasil disimpan ke koleksi!", [
        {
          text: "OK",
          onPress: () => {
            resetForm();
            router.push("/");
          },
        },
      ]);
    } catch (error) {
      console.error("Gagal menyimpan resep:", error);
      Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan resep.");
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setPosterUri(null);
    setTitle("");
    setCategory(null);
    setIngredients([{ id: Date.now().toString(), name: "", amount: "" }]);
    setSteps([
      {
        id: (Date.now() + 1).toString(),
        instruction: "",
        hasTimer: false,
        durationSeconds: "",
      },
    ]);
  };

  return (
    <View className="flex-1 bg-sketchBg">
      <ScrollView
        className="flex-1 px-4 pt-14"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* 🚀 A. HEADER INTERAKTIF (Typewriter + GIF) */}
        <View className="flex-row items-center mb-6 gap-4 bg-sketchCard p-4 rounded-3xl border border-gray-100 shadow-sm">
          <View className="h-14 w-14 rounded-full overflow-hidden bg-sketchTerracotta/0 items-center justify-center border border-sketchTerracotta/0">
            <Image
              source={{
                uri: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmt2OTF5dWlxZXR5bDMxb281bmhuMnZpOHlyemg2OTZoaHhjd3dpbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ea74cjF0jieXu/giphy.gif",
              }} // URL GIF Estetik/Sticker
              className="w-10 h-10"
              resizeMode="contain"
            />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-1 mb-0.5">
              <NotePencil color="#2F3E46" size={14} weight="bold" />
              <Text className="text-sketchMuted text-xs font-bold uppercase tracking-widest">
                Resep Baru
              </Text>
            </View>
            <TypewriterText
              text={`Halo Chef ${chefName}, masak apa hari ini?`}
              delay={60}
            />
          </View>
        </View>

        {/* B. Kanvas Poster */}
        <RecipePosterCanvas onPosterSaved={(uri) => setPosterUri(uri)} />

        {/* D. Metadata Form */}
        <View className="bg-sketchCard rounded-2xl p-4 mb-4 mt-2">
          <Text className="text-sketchMuted text-md mb-1 font-medium">
            Nama Masakan
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Contoh: Nasi Goreng Spesial"
            placeholderTextColor="#7F8C8D"
            className="text-sketchCharcoal text-base border-b border-gray-100 pb-2 mb-4"
          />

          <Text className="text-sketchMuted text-md mb-2 font-medium">
            Kategori
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setCategory(cat)}
                className={`px-5 py-2 rounded-full border ${
                  category === cat
                    ? "bg-sketchTerracotta border-sketchTerracotta"
                    : "border-gray-300"
                }`}
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

        {/* E. Bahan Dinamis */}
        <View className="bg-sketchCard rounded-2xl border-[0.5px] border-gray-200 p-4 mb-4">
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
            className="flex-row items-center justify-center gap-2 mt-3 bg-sketchBg py-3 rounded-xl border border-dashed border-sketchSage"
          >
            <Plus color="#81B29A" size={18} weight="bold" />
            <Text className="text-sketchSage font-semibold">
              Tambah Bahan Baru
            </Text>
          </Pressable>
        </View>

        {/* F. Langkah Memasak */}
        <Text className="text-sketchCharcoal font-bold mb-3 px-1">
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
          className="flex-row items-center justify-center gap-2 bg-sketchCard py-3 rounded-xl border border-dashed border-sketchSage mb-10"
        >
          <Plus color="#81B29A" size={18} weight="bold" />
          <Text className="text-sketchSage font-semibold">
            Tambah Langkah Baru
          </Text>
        </Pressable>
      </ScrollView>

      {/* G. Footer Aksi */}
      <LinearGradient
        colors={["transparent", "#FDFBF7"]}
        className="absolute bottom-0 left-0 right-0 h-24 px-4 justify-end pb-6"
        pointerEvents="box-none"
      >
        <Pressable
          onPress={handleSubmit}
          disabled={isSaving}
          className={`flex-row items-center justify-center gap-2 bg-sketchTerracotta rounded-2xl py-4 shadow-sm ${
            isSaving ? "opacity-60" : ""
          }`}
        >
          <FloppyDisk color="#FFFFFF" size={20} weight="bold" />
          <Text className="text-white font-bold text-base">
            {isSaving ? "Menyimpan..." : "Simpan Resep ke Koleksi"}
          </Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}
