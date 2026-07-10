import { getFavoriteRecipes } from "@/database/favorites";
import { type Recipe } from "@/database/recipes";
import { useFocusEffect, useRouter } from "expo-router";
import { Heart } from "phosphor-react-native";
import { useCallback, useState } from "react";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500";

function formatDuration(totalSeconds?: number | null) {
  if (!totalSeconds) return "No timer";
  if (totalSeconds >= 3600) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.ceil((totalSeconds % 3600) / 60);
    return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
  }
  return `${Math.ceil(totalSeconds / 60)} min`;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Recipe[]>([]);

  useFocusEffect(
    useCallback(() => {
      try {
        const data = getFavoriteRecipes();
        setFavorites(data);
      } catch (e) {
        console.error(e);
      }
    }, [])
  );

  return (
    <View className="flex-1 bg-sketchBg px-4 pt-14">
      <Text className="text-2xl font-bold text-sketchCharcoal">
        Favorites
      </Text>
      <Text className="mt-0.5 text-sm text-sketchMuted">
        Recipes you have saved
      </Text>

      <FlatList
        data={favorites}
        numColumns={2}
        className="mt-6 flex-1"
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <View className="mt-10 items-center rounded-2xl bg-sketchCard p-8">
            <Heart color="#E07A5F" size={44} weight="duotone" />
            <Text className="mt-4 text-center text-base font-semibold text-sketchCharcoal">
              No favorites yet
            </Text>
            <Text className="mt-2 text-center text-sm text-sketchMuted">
              Save your favorite recipes so they are easy to find later.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="m-1.5 flex-1 rounded-2xl border border-gray-50 bg-sketchCard p-3"
            style={{ elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 }}
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
              <View className="flex-row items-center gap-1 flex-wrap justify-end max-w-[65%]">
                {(item.cook_count ?? 0) > 0 && (
                  <View className="rounded-full bg-sketchTerracotta/20 px-2 py-0.5">
                    <Text className="text-[10px] font-bold text-sketchTerracotta">
                      Cooked {item.cook_count}x
                    </Text>
                  </View>
                )}
                <View className="rounded-full bg-sketchSage/20 px-2 py-0.5">
                  <Text className="text-[10px] text-sketchSage">
                    {item.category}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
