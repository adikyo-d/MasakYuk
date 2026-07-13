import { getFavoriteRecipes } from "@/database/favorites";
import { Recipe } from "@/database/recipes";
import { useFocusEffect, useRouter } from "expo-router";
import {
    CookingPot,
    Fire,
    Heart,
    MagnifyingGlass,
    SquaresFour,
} from "phosphor-react-native";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
    FlatList,
    FlatListProps,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    Extrapolation,
    FadeInDown,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";

type AnimatedRecipeFlatList = React.ComponentClass<
  Animated.AnimateProps<FlatListProps<Recipe>>
>;

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList,
) as unknown as AnimatedRecipeFlatList;

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

type FavoriteCardProps = {
  item: Recipe;
  index: number;
  onPress: (id: number) => void;
};

const FavoriteCard = memo(({ item, index, onPress }: FavoriteCardProps) => {
  const scale = useSharedValue(1);
  const imageScale = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: (1 - scale.value) * -6 }],
  }));

  const imageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(350)
        .delay(Math.min(index, 10) * 70)
        .springify()
        .damping(14)}
      className="m-1.5 flex-1"
    >
      <Animated.View style={cardStyle} className="flex-1">
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={() => {
            scale.value = withTiming(0.96, { duration: 90 });
            imageScale.value = withTiming(1.05, { duration: 150 });
          }}
          onPressOut={() => {
            scale.value = withSpring(1, { damping: 12, stiffness: 200 });
            imageScale.value = withSpring(1, { damping: 12, stiffness: 200 });
          }}
          onPress={() => onPress(item.id)}
          className="rounded-2xl border border-gray-50 bg-sketchCard p-3 flex-1"
          style={{
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
          }}
        >
          <View className="mb-2 h-32 w-full overflow-hidden rounded-xl bg-gray-100">
            <Animated.Image
              source={{ uri: item.cover_image || FALLBACK_IMAGE }}
              className="h-full w-full"
              style={imageStyle}
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
      </Animated.View>
    </Animated.View>
  );
});

export default function FavoritesScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const scrollY = useSharedValue(0);
  const heartPulse = useSharedValue(1);

  useFocusEffect(
    useCallback(() => {
      try {
        const data = getFavoriteRecipes();
        setFavorites(data);
      } catch (e) {
        console.error(e);
      }
    }, []),
  );

  useEffect(() => {
    heartPulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 300 }),
        withTiming(1, { duration: 300 }),
        withDelay(4400, withTiming(1, { duration: 0 })),
      ),
      -1,
      false,
    );
  }, []);

  const categories = useMemo(() => {
    const set = new Set(favorites.map((f) => f.category).filter(Boolean));
    return ["All", ...Array.from(set)] as string[];
  }, [favorites]);

  const cookedCount = useMemo(
    () => favorites.filter((f) => (f.cook_count ?? 0) > 0).length,
    [favorites],
  );

  const filtered = useMemo(() => {
    return favorites.filter((f) => {
      const matchesCategory = category === "All" || f.category === category;
      const matchesSearch = f.title
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [favorites, category, search]);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  // 🚀 FIX: Animasi header disederhanakan, HANYA menggunakan Transform dan Opacity (Sangat ringan!)
  const headerStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, 80], [1, 0], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, 80],
            [0, -20],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartPulse.value }],
  }));

  const handlePressRecipe = useCallback(
    (id: number) => {
      router.push(`/${id}`);
    },
    [router],
  );

  const renderFavoriteItem = useCallback(
    ({ item, index }: { item: Recipe; index: number }) => (
      <FavoriteCard item={item} index={index} onPress={handlePressRecipe} />
    ),
    [handlePressRecipe],
  );

  return (
    <View className="flex-1 bg-sketchBg">
      <AnimatedFlatList
        data={filtered}
        numColumns={2}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        className="flex-1"
        keyExtractor={(item) => String(item.id)}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        // 🚀 FIX: removeClippedSubviews dimatikan agar scroll ke atas tidak jumping/blank
        removeClippedSubviews={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 56, // Padding aman dari atas layar
          paddingBottom: 120,
        }}
        // 🚀 FIX: Semua Elemen Header dimasukkan ke dalam ListHeaderComponent
        ListHeaderComponent={
          <View className="pb-4">
            {/* Hero Header */}
            <Animated.View style={headerStyle}>
              <View className="flex-row items-center gap-2">
                <Animated.View style={heartStyle}>
                  <Heart color="#E07A5F" size={26} weight="fill" />
                </Animated.View>
                <Text className="text-2xl font-bold text-sketchCharcoal">
                  Favorites
                </Text>
              </View>
              <Text className="mt-0.5 text-sm text-sketchMuted">
                {favorites.length} Recipes Saved
              </Text>
            </Animated.View>

            {/* Quote card */}
            <View className="mt-4 overflow-hidden">
              <View className="items-center justify-center rounded-xl bg-sketchTerracotta/10 px-4 py-2.5">
                <Text className="text-center text-xs italic text-sketchTerracotta">
                  "Every favorite recipe has a story."
                </Text>
              </View>
            </View>

            {/* Statistik ringkas */}
            {favorites.length > 0 && (
              <View className="mt-4 flex-row gap-2">
                <View className="flex-1 items-center rounded-xl bg-sketchCard py-2.5 shadow-sm">
                  <Text className="text-base font-bold text-sketchCharcoal">
                    {favorites.length}
                  </Text>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <Heart size={12} color="#7F8C8D" weight="fill" />
                    <Text className="text-[10px] text-sketchMuted">
                      Favorites
                    </Text>
                  </View>
                </View>
                <View className="flex-1 items-center rounded-xl bg-sketchCard py-2.5 shadow-sm">
                  <Text className="text-base font-bold text-sketchCharcoal">
                    {cookedCount}
                  </Text>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <Fire size={12} color="#7F8C8D" weight="fill" />
                    <Text className="text-[10px] text-sketchMuted">Cooked</Text>
                  </View>
                </View>
                <View className="flex-1 items-center rounded-xl bg-sketchCard py-2.5 shadow-sm">
                  <Text className="text-base font-bold text-sketchCharcoal">
                    {categories.length - 1}
                  </Text>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <SquaresFour size={12} color="#7F8C8D" weight="fill" />
                    <Text className="text-[10px] text-sketchMuted">
                      Categories
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Search */}
            {favorites.length > 0 && (
              <View className="mt-4 flex-row items-center gap-2 rounded-xl bg-sketchCard px-3 py-2.5 shadow-sm">
                <MagnifyingGlass color="#7F8C8D" size={18} />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search favorites..."
                  placeholderTextColor="#7F8C8D"
                  className="flex-1 text-sm text-sketchCharcoal"
                />
              </View>
            )}

            {/* Horizontal Scroll Kategori */}
            {categories.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                bounces={false}
                className="mt-4"
                style={{
                  flexGrow: 0,
                  height: 44,
                  minHeight: 44,
                  maxHeight: 44,
                }}
                contentContainerClassName="items-center gap-2"
              >
                {categories.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setCategory(c)}
                    className={`items-center justify-center rounded-full px-4 py-3.5 ${
                      category === c ? "bg-sketchTerracotta" : "bg-sketchCard"
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        category === c ? "text-white" : "text-sketchMuted"
                      }`}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        }
        ListEmptyComponent={
          <Animated.View
            entering={FadeInDown.duration(300)}
            className="mt-10 items-center rounded-2xl bg-sketchCard p-8"
          >
            <Heart color="#E07A5F" size={44} weight="duotone" />
            <Text className="mt-4 text-center text-base font-semibold text-sketchCharcoal">
              No Favorites Yet
            </Text>
            <Text className="mt-2 text-center text-sm text-sketchMuted">
              Tap the heart icon while browsing recipes.
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/")}
              className="mt-5 flex-row items-center justify-center gap-2 rounded-xl bg-sketchTerracotta px-5 py-3"
            >
              <CookingPot size={18} color="#FFFFFF" weight="bold" />
              <Text className="font-semibold text-white">Browse Recipes</Text>
            </TouchableOpacity>
          </Animated.View>
        }
        renderItem={renderFavoriteItem}
      />
    </View>
  );
}
