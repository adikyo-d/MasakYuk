import { getProfile } from "@/database/profile";
import { getAllRecipes, type Recipe } from "@/database/recipes";
import { useFocusEffect, useRouter } from "expo-router";
import { CloudSun, Moon, Quotes, Sun } from "phosphor-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
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

const DAILY_QUOTES = [
  "Masak dengan cinta, sajikan dengan bangga. ✨",
  "Setiap resep punya cerita, apa ceritamu hari ini? 🍳",
  "Bumbu rahasia terbaik adalah perut yang lapar! 😋",
  "Jangan takut bereksperimen di dapur hari ini. 🧂",
  "Makanan enak adalah kunci mood yang bagus. 🥘",
  "Dapur berantakan tanda koki sedang berkarya! 🧑‍🍳",
];

// 🚀 KOMPONEN ANIMASI KETIK (VERSI SLICING - ANTI SKIP & ANTI UNDEFINED)
const TypewriterText = ({
  text,
  delay = 50,
}: {
  text: string;
  delay?: number;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mengamankan emoji dengan mengubah string menjadi Array
  const chars = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    setCurrentIndex(0); // Selalu mulai dari 0 saat kutipan berubah

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        // Jika index sudah mencapai panjang kata, hentikan hitungan
        if (prev >= chars.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1; // Terus bertambah 1
      });
    }, delay);

    return () => clearInterval(timer);
  }, [chars, delay]);

  // Rahasia tanpa bug: Selalu memotong kalimat asli, bukan menyambung huruf baru
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

export default function BerandaScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [profileName, setProfileName] = useState("Chef");
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  // 🚀 LOGIKA WAKTU DAN SAPAAN
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

  // 🚀 STATE UNTUK ROTASI KUTIPAN
  const [quoteIndex, setQuoteIndex] = useState(() =>
    Math.floor(Math.random() * DAILY_QUOTES.length),
  );
  const [quoteKey, setQuoteKey] = useState(0);

  // 🚀 EFEK INTERVAL 1 MENIT
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => {
        let next = Math.floor(Math.random() * DAILY_QUOTES.length);
        while (next === prev) {
          next = Math.floor(Math.random() * DAILY_QUOTES.length);
        }
        return next;
      });
      setQuoteKey((prev) => prev + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

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
      {/* 🚀 HEADER INTERAKTIF BARU */}
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 pr-4">
          <View className="flex-row items-center gap-2 mb-1">
            {GreetingIcon}
            <Text className="text-2xl font-bold text-sketchCharcoal">
              {greeting}, {profileName.split(" ")[0]}!
            </Text>
          </View>

          {/* Card Kata Hari Ini */}
          <View className="bg-sketchCard/80 p-3 rounded-2xl border border-gray-100 shadow-sm mt-3 flex-row gap-2">
            <Quotes
              color="#81B29A"
              size={18}
              weight="fill"
              className="mt-0.5"
            />
            <View className="flex-1">
              <TypewriterText
                key={quoteKey}
                text={DAILY_QUOTES[quoteIndex]}
                delay={40}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          className="h-12 w-12 overflow-hidden items-center justify-center rounded-full bg-sketchTerracotta shadow-sm"
          onPress={() => router.push("/profil")}
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
      </View>

      <TextInput
        placeholder="Cari resep rahasiamu..."
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
              {error ? "Database is not ready" : "Belum ada resep"}
            </Text>
            <Text className="mt-1 text-sm text-sketchMuted">
              {error ?? "Belum ada resep yang sesuai dengan pencarianmu."}
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
