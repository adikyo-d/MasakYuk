import { getProfile } from "@/database/profile";
import { getAllRecipes, type Recipe } from "@/database/recipes";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
    FlatList,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500";

const CATEGORY_FILTERS = [
  { label: "All", value: "All" },
  { label: "Main Course", value: "Main Couese" },
  { label: "Side Dish", value: "Side Dish" },
  { label: "Soup", value: "Soup" },
  { label: "Snack", value: "Snack" },
  { label: "Drink", value: "Drink" },
  { label: "Dessert", value: "Dessert" },
  { label: "Other", value: "Other" },
];

function formatDuration(totalSeconds?: number | null) {
  if (!totalSeconds) return "No timer";
  if (totalSeconds >= 3600) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.ceil((totalSeconds % 3600) / 60);
    return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
  }
  return `${Math.ceil(totalSeconds / 60)} min`;
}

export default function BerandaScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [profileName, setProfileName] = useState("Chef");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      try {
        const allRecipes = getAllRecipes();
        setRecipes(allRecipes);

        const profile = getProfile();
        if (profile) setProfileName(profile.name);

        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Database failed to open",
        );
      }
    }, []),
  );

  const filteredRecipes = recipes.filter((recipe) => {
    const matchCategory =
      selectedCategory === "All" || recipe.category === selectedCategory;
    const matchSearch =
      searchQuery === "" ||
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <View className="flex-1 bg-sketchBg px-4 pt-14">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-bold text-sketchCharcoal">
            Hi chef, {profileName}
          </Text>
          <Text className="mt-0.5 text-sm text-sketchMuted">
            What would you like to cook today?
          </Text>
        </View>
        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-sketchTerracotta shadow-sm">
          <Text className="font-bold text-white">
            {profileName.slice(0, 4).toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Search your secret recipes..."
        placeholderTextColor="#7F8C8D"
        value={searchQuery}
        onChangeText={setSearchQuery}
        className="mt-5 w-full rounded-2xl border border-gray-100 bg-sketchCard p-3.5 text-sketchCharcoal shadow-sm"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-4"
        style={{ flexGrow: 0, height: 40 }}
        contentContainerClassName="items-center gap-2"
      >
        {CATEGORY_FILTERS.map((category) => (
          <TouchableOpacity
            key={category.value}
            onPress={() => setSelectedCategory(category.value)}
            className={`h-9 justify-center rounded-full border px-4 ${
              selectedCategory === category.value
                ? "border-sketchTerracotta bg-sketchTerracotta"
                : "border-gray-100 bg-sketchCard"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                selectedCategory === category.value
                  ? "text-white"
                  : "text-sketchMuted"
              }`}
            >
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filteredRecipes}
        numColumns={2}
        className="mt-4 flex-1"
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <View className="mt-10 rounded-2xl bg-sketchCard p-5">
            <Text className="text-base font-bold text-sketchCharcoal">
              {error ? "Database is not ready" : "No recipes yet"}
            </Text>
            <Text className="mt-1 text-sm text-sketchMuted">
              {error ?? "No recipes match this category or search."}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="m-1.5 flex-1 rounded-2xl border border-gray-50 bg-sketchCard p-3 shadow-md"
            onPress={() => router.push(`/${item.id}`)}
          >
            <View className="mb-2 h-32 w-full overflow-hidden rounded-xl bg-gray-100">
              <Image
                source={{ uri: item.cover_image || FALLBACK_IMAGE }}
                className="h-full w-full"
                resizeMode="cover"
              />
            </View>
            <Text
              className="text-sm font-bold text-sketchCharcoal"
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <View className="mt-1 flex-row items-center justify-between">
              <Text className="text-xs text-sketchMuted">
                {formatDuration(item.total_duration_seconds)}
              </Text>
              <View className="rounded-full bg-sketchSage/20 px-2 py-0.5">
                <Text className="text-[10px] text-sketchSage">
                  {item.category}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
