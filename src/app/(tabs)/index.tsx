import { getProfile } from "@/database/profile";
import { getAllRecipes, type Recipe } from "@/database/recipes";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import { CloudSun, Moon, Quotes, Sun, Ticket } from "phosphor-react-native";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Image,
    Pressable,
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
    withSpring,
} from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=500";

const CATEGORY_FILTERS = [
  { label: "All", value: "All" },
  { label: "Main Course", value: "Main Course" },
  { label: "Side Dish", value: "Side Dish" },
  { label: "Soup", value: "Soup" },
  { label: "Snack", value: "Snack" },
  { label: "Drink", value: "Drink" },
  { label: "Dessert", value: "Dessert" },
  { label: "Other", value: "Other" },
];

const DAILY_QUOTES = [
  "Masak dengan cinta, sajikan dengan bangga. ✨",
  "Setiap resep punya cerita, apa ceritamu hari ini? 🍳",
  "Bumbu rahasia terbaik adalah perut yang lapar! 😋",
  "Jangan takut bereksperimen di dapur hari ini. 🧂",
  "Makanan enak adalah kunci mood yang bagus. 🥘",
  "Dapur berantakan tanda koki sedang berkarya! 🧑‍🍳",
  "Masakan terbaik dibuat untuk membuat seseorang tersenyum (kasih gw contohnya). 🍽️",
  "Jangan pernah meremehkan kekuatan sepiring makanan hangat. 🥘",
  "Seorang koki tidak pernah berhenti belajar rasa baru. 👨‍🍳",
  "Hidangan yang baik dimulai dari bahan yang dihargai. 🌿",
  "Api boleh panas, tapi hati koki harus tetap tenang. 🔥",
  "Memasak adalah cara lain untuk menunjukkan perhatian. ❤️",
];

const HEADER_COLLAPSE_RANGE = [0, 120];

const TypewriterText = ({
  text,
  delay = 50,
  skipAnimation = false,
  onDone,
}: {
  text: string;
  delay?: number;
  skipAnimation?: boolean;
  onDone?: () => void;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const chars = useMemo(() => Array.from(text), [text]);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (skipAnimation) {
      setCurrentIndex(chars.length);
      return;
    }
    setCurrentIndex(0);
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= chars.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, delay);
    return () => clearInterval(timer);
  }, [chars, delay, skipAnimation]);

  useEffect(() => {
    if (chars.length > 0 && currentIndex >= chars.length) {
      onDoneRef.current?.();
    }
  }, [currentIndex, chars.length]);

  const displayedText = chars.slice(0, currentIndex).join("");

  return (
    <Text className="text-sm italic text-sketchMuted leading-5">
      "{displayedText}"
    </Text>
  );
};

function formatDuration(totalSeconds?: number | null) {
  if (!totalSeconds) return "No timer";
  if (totalSeconds >= 3600) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.ceil((totalSeconds % 3600) / 60);
    return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
  }
  return `${Math.ceil(totalSeconds / 60)} min`;
}

// 🚀 Card resep dioptimalkan dengan React.memo
type RecipeCardProps = {
  item: Recipe;
  index: number;
  onPress: (id: number) => void;
};

const RecipeCard = memo(({ item, index, onPress }: RecipeCardProps) => {
  const scale = useSharedValue(1);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 8) * 60).springify()}
      style={{ flex: 1 }}
      className="m-1.5"
    >
      <AnimatedTouchable
        activeOpacity={1}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 15 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15 });
        }}
        onPress={() => onPress(item.id)}
        style={[
          pressStyle,
          {
            elevation: 4,
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 5 },
          },
        ]}
        className="rounded-2xl border border-gray-50 bg-sketchCard p-3"
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
      </AnimatedTouchable>
    </Animated.View>
  );
});

export default function BerandaScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [profileName, setProfileName] = useState("Chef");
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const currentHour = new Date().getHours();
  const greeting = useMemo(() => {
    if (currentHour < 11) return "Selamat Pagi";
    if (currentHour < 15) return "Selamat Siang";
    if (currentHour < 19) return "Selamat Sore";
    return "Selamat Malam";
  }, [currentHour]);

  const GreetingIcon = useMemo(() => {
    if (currentHour < 15)
      return <Sun color="#E07A5F" size={24} weight="duotone" />;
    if (currentHour < 19)
      return <CloudSun color="#E07A5F" size={24} weight="duotone" />;
    return <Moon color="#2F3E46" size={24} weight="duotone" />;
  }, [currentHour]);

  const [quoteIndex, setQuoteIndex] = useState(() =>
    Math.floor(Math.random() * DAILY_QUOTES.length),
  );
  const [quoteKey, setQuoteKey] = useState(0);
  // 🚀 Status ketik selesai/belum, dipakai untuk logika interupsi klik
  const [isQuoteTyped, setIsQuoteTyped] = useState(false);
  const [forceCompleteQuote, setForceCompleteQuote] = useState(false);
  const interruptTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // 🚀 Pindah ke quote acak berikutnya, dipakai baik oleh interval otomatis
  // maupun oleh interupsi klik. Setiap kali dipanggil, quoteKey berubah
  // sehingga TypewriterText remount dan siklus 10 detik dimulai lagi.
  const goToNextQuote = useCallback(() => {
    setQuoteIndex((prev) => {
      let next = Math.floor(Math.random() * DAILY_QUOTES.length);
      while (next === prev) {
        next = Math.floor(Math.random() * DAILY_QUOTES.length);
      }
      return next;
    });
    setQuoteKey((prev) => prev + 1);
    setIsQuoteTyped(false);
    setForceCompleteQuote(false);
  }, []);

  // ⏱️ Ganti quote otomatis tiap 10 detik. Bergantung pada quoteKey supaya
  // timer selalu di-reset setiap kali quote berganti (baik otomatis maupun
  // karena diklik), sehingga jeda antar quote konsisten 10 detik.
  useEffect(() => {
    const interval = setInterval(goToNextQuote, 10000);
    return () => clearInterval(interval);
  }, [quoteKey, goToNextQuote]);

  useEffect(() => {
    return () => {
      if (interruptTimeoutRef.current) {
        clearTimeout(interruptTimeoutRef.current);
      }
    };
  }, []);

  // 👆 Handler tap pada quote: kalau teks masih diketik, paksa selesai dulu
  // (interupsi), lalu setelah jeda singkat pindah ke quote berikutnya.
  // Kalau teks sudah selesai diketik, langsung pindah ke quote berikutnya.
  const handleQuotePress = useCallback(() => {
    if (interruptTimeoutRef.current) {
      clearTimeout(interruptTimeoutRef.current);
      interruptTimeoutRef.current = null;
    }

    if (!isQuoteTyped) {
      setForceCompleteQuote(true);
      interruptTimeoutRef.current = setTimeout(() => {
        goToNextQuote();
      }, 350);
    } else {
      goToNextQuote();
    }
  }, [isQuoteTyped, goToNextQuote]);

  useFocusEffect(
    useCallback(() => {
      try {
        const allRecipes = getAllRecipes();
        setRecipes(allRecipes);

        const profile = getProfile();
        if (profile) {
          setProfileName(profile.name);
          setProfileAvatar(profile.avatar);
        }

        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Database failed to open",
        );
      }
    }, []),
  );

  // 🚀 Memoize filter resep agar tidak terus menerus direkalkulasi
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchCategory =
        selectedCategory === "All" || recipe.category === selectedCategory;
      const matchSearch =
        searchQuery === "" ||
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [recipes, selectedCategory, searchQuery]);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      HEADER_COLLAPSE_RANGE,
      [1, 0],
      Extrapolation.CLAMP,
    ),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          HEADER_COLLAPSE_RANGE,
          [0, -50],
          Extrapolation.CLAMP,
        ),
      },
      {
        scale: interpolate(
          scrollY.value,
          HEADER_COLLAPSE_RANGE,
          [1, 0.95],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const searchStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          HEADER_COLLAPSE_RANGE,
          [0, -25],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const miniHeaderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      HEADER_COLLAPSE_RANGE,
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  // 🚀 Ekstrak fungsi navigasi menggunakan useCallback
  const handlePressRecipe = useCallback(
    (id: number) => {
      router.push(`/${id}`);
    },
    [router],
  );

  // 🚀 Ekstrak komponen renderItem menggunakan useCallback
  const renderRecipeItem = useCallback(
    ({ item, index }: { item: Recipe; index: number }) => (
      <RecipeCard item={item} index={index} onPress={handlePressRecipe} />
    ),
    [handlePressRecipe],
  );

  return (
    <View className="flex-1 bg-sketchBg">
      {/* Mini-header sticky — muncul begitu header besar mulai hilang */}
      <Animated.View
        pointerEvents="none"
        style={miniHeaderStyle}
        className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between bg-sketchBg/95 px-4 pb-2 pt-14 border-b border-gray-100"
      >
        <View className="flex-row items-center gap-2">
          {GreetingIcon}
          <Text className="text-base font-bold text-sketchCharcoal">
            {greeting}, {profileName.split(" ")[0]}!
          </Text>
        </View>
      </Animated.View>

      <Animated.FlatList
        data={filteredRecipes}
        numColumns={2}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        decelerationRate="fast"
        initialNumToRender={8}
        windowSize={5}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 56,
          paddingBottom: 120,
        }}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <View className="pb-2">
            <Animated.View
              style={headerStyle}
              className="flex-row items-start justify-between mb-2"
            >
              <View className="flex-1 pr-4">
                <View className="flex-row items-center gap-2 mb-1">
                  {GreetingIcon}
                  <Text className="text-2xl font-bold text-sketchCharcoal">
                    {greeting}, {profileName.split(" ")[0]}!
                  </Text>
                </View>

                <Pressable
                  onPress={handleQuotePress}
                  className="bg-sketchCard/80 p-3 rounded-2xl border border-gray-100 shadow-sm mt-3 flex-row gap-2 active:opacity-70"
                >
                  <View className="mt-0.5">
                    <Quotes color="#81B29A" size={18} weight="fill" />
                  </View>
                  <View className="flex-1">
                    <TypewriterText
                      key={quoteKey}
                      text={DAILY_QUOTES[quoteIndex]}
                      delay={40}
                      skipAnimation={forceCompleteQuote}
                      onDone={() => setIsQuoteTyped(true)}
                    />
                  </View>
                </Pressable>
              </View>

              <View className="items-center gap-2">
                <TouchableOpacity
                  className="h-12 w-12 overflow-hidden items-center justify-center rounded-full bg-sketchTerracotta shadow-sm"
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push("/profil");
                  }}
                >
                  {profileAvatar ? (
                    <Image
                      source={{ uri: profileAvatar }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="font-bold text-white text-lg">
                      {profileName.slice(0, 2).toUpperCase()}
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  className="h-9 w-9 items-center justify-center rounded-full bg-sketchCard shadow-sm border border-gray-100"
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.push("/import-code");
                  }}
                >
                  <Ticket color="#E07A5F" size={16} weight="duotone" />
                </TouchableOpacity>
              </View>
            </Animated.View>

            <Animated.View style={searchStyle}>
              <TextInput
                placeholder="Cari resep rahasiamu..."
                placeholderTextColor="#7F8C8D"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="mt-3 w-full rounded-2xl border border-gray-100 bg-sketchCard p-3.5 text-sketchCharcoal shadow-sm"
              />
            </Animated.View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              bounces={false}
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

            <View className="h-4" />
          </View>
        }
        ListEmptyComponent={
          <View className="mt-10 rounded-2xl bg-sketchCard p-5">
            <Text className="text-base font-bold text-sketchCharcoal">
              {error ? "Database is not ready" : "Belum ada resep"}
            </Text>
            <Text className="mt-1 text-sm text-sketchMuted">
              {error ?? "Belum ada resep yang sesuai dengan pencarianmu."}
            </Text>
          </View>
        }
        renderItem={renderRecipeItem}
      />
    </View>
  );
}
