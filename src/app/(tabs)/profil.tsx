import { useAuth } from "@/contexts/AuthContext";
import { getProfile, updateProfile } from "@/database/profile";
import { getStats } from "@/database/recipes";
import { supabase } from "@/lib/supabase";
import { syncRecipesToCloud, importRecipesFromCloud } from "@/services/syncService";
import { Directory, File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Alert,
    Image,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    Extrapolation,
    FadeIn,
    FadeInDown,
    FadeOut,
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";

// 🚀 IMPORT PHOSPHOR ICONS
import {
    Check,
    Cloud,
    CloudArrowDown,
    CookingPot,
    Eye,
    Fire,
    PencilSimple,
    Sparkle,
    Star,
} from "phosphor-react-native";

const avatarsDir = new Directory(Paths.document, "avatars");

function ensureAvatarDir() {
  if (!avatarsDir.exists) {
    avatarsDir.create({ intermediates: true });
  }
}

async function saveAvatarLocally(pickedUri: string): Promise<string> {
  ensureAvatarDir();
  const ext = Paths.extname(pickedUri).replace(".", "") || "jpg";
  const fileName = `avatar_${Date.now()}.${ext}`;
  const dest = new File(avatarsDir, fileName);
  const source = new File(pickedUri);
  await source.copy(dest);
  return dest.uri;
}

function AnimatedPressable({
  onPress,
  disabled,
  className,
  children,
}: {
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={style}>
      <TouchableOpacity
        activeOpacity={1}
        disabled={disabled}
        onPressIn={() => {
          scale.value = withTiming(0.96, { duration: 90 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 10, stiffness: 200 });
        }}
        onPress={onPress}
        className={className}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

type SaveState = "idle" | "saving" | "success";

export default function ProfilScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [loading, setLoading] = useState(true);

  // Stats & Gelar Gamifikasi
  const [stats, setStats] = useState({ recipes: 0, cooked: 0, favorites: 0 });
  const [chefTitle, setChefTitle] = useState("Novice Cook");

  const avatarScale = useSharedValue(1);
  const avatarRing = useSharedValue(0);
  const editIconRotate = useSharedValue(0);
  const cloudPulse = useSharedValue(1);
  const scrollY = useSharedValue(0);

  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, []),
  );

  useEffect(() => {
    if (user) {
      cloudPulse.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 900 }),
          withTiming(1, { duration: 900 }),
        ),
        -1,
        true,
      );
    } else {
      cloudPulse.value = 1;
    }
  }, [user]);

  function loadProfile() {
    setLoading(true);
    setTimeout(() => {
      const profile = getProfile();
      if (profile) {
        setName(profile.name);
        setBirthday(profile.birthday ?? "");
        setAvatarUri(profile.avatar);
      }

      const currentStats = getStats();
      setStats(currentStats);

      const totalScore = currentStats.recipes + currentStats.cooked;

      // Menghapus emoji dari gelar agar lebih profesional
      if (totalScore < 5) setChefTitle("Novice Cook");
      else if (totalScore < 15) setChefTitle("Home Chef");
      else if (totalScore < 30) setChefTitle("Sous Chef");
      else if (totalScore < 50) setChefTitle("Head Chef");
      else setChefTitle("Master Chef");

      setLoading(false);
    }, 350);
  }

  const isBirthdayToday = useMemo(() => {
    if (!birthday || !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) return false;

    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayString = `${mm}-${dd}`;

    const birthdayString = birthday.substring(5);

    return todayString === birthdayString;
  }, [birthday]);

  async function pickAvatar() {
    const permResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permResult.granted) {
      Alert.alert(
        "Permission Required",
        "The app needs gallery access to change your profile photo.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    try {
      if (avatarUri) {
        const oldFile = new File(avatarUri);
        if (oldFile.exists) oldFile.delete();
      }

      const localPath = await saveAvatarLocally(result.assets[0].uri);
      setAvatarUri(localPath);
      updateProfile(name, birthday || null, localPath);

      avatarScale.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withSpring(1.08, { damping: 6, stiffness: 180 }),
        withSpring(1, { damping: 8, stiffness: 180 }),
      );
      avatarRing.value = withTiming(avatarRing.value + 360, {
        duration: 600,
      });
    } catch {
      Alert.alert("Failed", "Could not save the photo. Please try again.");
    }
  }

  function handleAvatarPress() {
    tapCountRef.current += 1;

    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);

    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      avatarScale.value = withSequence(
        withTiming(1.2, { duration: 120 }),
        withSpring(1, { damping: 5 }),
      );
      Alert.alert("🐱 Meow!", "Kucing Chef Terbangun!");
      return;
    }

    tapTimerRef.current = setTimeout(() => {
      if (tapCountRef.current > 0 && tapCountRef.current < 5) {
        pickAvatar();
      }
      tapCountRef.current = 0;
    }, 320);
  }

  function handleSave() {
    if (!name.trim()) {
      Alert.alert("Name Required", "Name cannot be empty.");
      return;
    }

    if (birthday && !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
      Alert.alert(
        "Invalid Format",
        "Birthday must use YYYY-MM-DD format, for example: 2000-01-15",
      );
      return;
    }

    setSaveState("saving");
    try {
      updateProfile(name.trim(), birthday || null, avatarUri ?? undefined);
      setTimeout(() => {
        setSaveState("success");
        setTimeout(() => {
          setSaveState("idle");
          setIsEditing(false);
        }, 900);
      }, 500);
    } catch {
      setSaveState("idle");
      Alert.alert("Failed", "Could not save your profile. Please try again.");
    }
  }

  function toggleEdit(next: boolean) {
    editIconRotate.value = withTiming(next ? 180 : 0, { duration: 300 });
    setIsEditing(next);
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Gagal Keluar", error.message);
    }
  };

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const avatarAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: avatarScale.value }],
  }));

  const ringAnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${avatarRing.value}deg` }],
  }));

  const editIconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${editIconRotate.value}deg` }],
  }));

  const cloudDotStyle = useAnimatedStyle(() => ({
    opacity: cloudPulse.value,
  }));

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const heroAvatarStyle = useAnimatedStyle(() => {
    const size = interpolate(
      scrollY.value,
      [0, 120],
      [112, 64],
      Extrapolation.CLAMP,
    );
    return {
      width: size,
      height: size,
      borderRadius: size / 2,
    };
  });

  const heroTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 80],
      [1, 0.4],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollY.value,
      [0, 120],
      [0, -10],
      Extrapolation.CLAMP,
    );
    return { opacity, transform: [{ translateY }] };
  });

  return (
    <Animated.ScrollView
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      className="flex-1 bg-sketchBg px-4 pt-14"
    >
      <Animated.View style={heroTitleStyle}>
        <Text className="text-2xl font-bold text-sketchCharcoal">Profile</Text>
        <Text className="mt-0.5 text-sm text-sketchMuted">
          Manage your personal information
        </Text>
      </Animated.View>

      {/* Hero Profile Card */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(0)}
        className="mt-6 items-center rounded-3xl bg-sketchCard px-6 py-8 shadow-md"
      >
        <View className="items-center justify-center">
          <Animated.View
            style={ringAnimStyle}
            className="absolute h-32 w-32 rounded-full border-2 border-sketchTerracotta opacity-40"
          />

          <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.7}>
            <Animated.View
              style={[avatarAnimStyle, heroAvatarStyle]}
              className="items-center justify-center overflow-hidden bg-sketchTerracotta shadow-lg"
            >
              {loading ? (
                <Animated.View
                  entering={FadeIn}
                  className="h-full w-full bg-gray-200"
                />
              ) : avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-3xl font-bold text-white">
                  {initials || "CH"}
                </Text>
              )}
            </Animated.View>
          </TouchableOpacity>

          {/* 🚀 FAB Edit dengan Phosphor Icon */}
          <TouchableOpacity
            onPress={() => toggleEdit(!isEditing)}
            className="absolute -bottom-1 -right-1 h-9 w-9 items-center justify-center rounded-full bg-sketchCharcoal shadow-md"
            activeOpacity={0.8}
          >
            <Animated.View style={editIconAnimStyle}>
              <PencilSimple size={18} color="#FFFFFF" weight="bold" />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="mt-4 items-center">
            <View className="mb-2 h-4 w-32 rounded bg-gray-200" />
            <View className="h-3 w-24 rounded bg-gray-200" />
          </View>
        ) : (
          <>
            <Text className="mt-4 text-xl font-bold text-sketchCharcoal">
              {name || "Belum diatur"}
            </Text>
            <Text className="text-sm text-sketchMuted font-medium">
              {chefTitle}
            </Text>

            <View className="mt-5 w-full flex-row justify-around border-t border-gray-100 pt-4">
              <View className="items-center">
                <Text className="text-base font-bold text-sketchCharcoal">
                  {stats.recipes}
                </Text>
                <View className="flex-row items-center gap-1 mt-0.5">
                  <CookingPot size={14} color="#7F8C8D" weight="fill" />
                  <Text className="text-xs text-sketchMuted">Recipes</Text>
                </View>
              </View>

              <View className="items-center">
                <Text className="text-base font-bold text-sketchCharcoal">
                  {stats.cooked}
                </Text>
                <View className="flex-row items-center gap-1 mt-0.5">
                  <Fire size={14} color="#7F8C8D" weight="fill" />
                  <Text className="text-xs text-sketchMuted">Cooked</Text>
                </View>
              </View>

              <View className="items-center">
                <Text className="text-base font-bold text-sketchCharcoal">
                  {stats.favorites}
                </Text>
                <View className="flex-row items-center gap-1 mt-0.5">
                  <Star size={14} color="#7F8C8D" weight="fill" />
                  <Text className="text-xs text-sketchMuted">Favorites</Text>
                </View>
              </View>
            </View>
          </>
        )}
      </Animated.View>

      {/* Card informasi personal */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(100)}
        className="mt-6 rounded-2xl bg-sketchCard p-5 shadow-sm"
      >
        <Text className="mb-3 text-xs font-bold tracking-wider text-sketchMuted">
          PERSONAL INFORMATION
        </Text>

        <View className="mb-4">
          <Text className="mb-1.5 text-xs font-medium text-sketchMuted">
            NAME
          </Text>
          {isEditing ? (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(120)}
            >
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#7F8C8D"
                className="rounded-xl border border-gray-200 bg-sketchBg px-4 py-3 text-base text-sketchCharcoal"
              />
            </Animated.View>
          ) : (
            <Animated.Text
              key={name}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(120)}
              className="text-lg font-semibold text-sketchCharcoal"
            >
              {name || "Belum diatur"}
            </Animated.Text>
          )}
        </View>

        <View className="mb-2 h-px bg-gray-100" />

        <View className="mt-4">
          <Text className="mb-1.5 text-xs font-medium text-sketchMuted">
            BIRTHDAY
          </Text>
          {isEditing ? (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(120)}
            >
              <TextInput
                value={birthday}
                onChangeText={setBirthday}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#7F8C8D"
                keyboardType={
                  Platform.OS === "ios" ? "numbers-and-punctuation" : "default"
                }
                className="rounded-xl border border-gray-200 bg-sketchBg px-4 py-3 text-base text-sketchCharcoal"
              />
            </Animated.View>
          ) : (
            <Animated.Text
              key={birthday}
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(120)}
              className="text-lg font-semibold text-sketchCharcoal"
            >
              {birthday || "Not set"}
            </Animated.Text>
          )}
        </View>
      </Animated.View>

      {/* 🚀 GAYA TOMBOL DIKEMBALIKAN KE BENTUK KOTAK (ROUNDED-2XL) + PHOSPHOR ICONS */}
      <View className="mt-6 mb-6">
        {isEditing ? (
          <View className="flex-row gap-3">
            <AnimatedPressable
              onPress={() => {
                toggleEdit(false);
                loadProfile();
              }}
              className="flex-1 items-center rounded-2xl border border-gray-200 bg-sketchCard py-4"
            >
              <Text className="font-semibold text-sketchMuted">Cancel</Text>
            </AnimatedPressable>
            <AnimatedPressable
              onPress={handleSave}
              disabled={saveState !== "idle"}
              className="flex-1 items-center justify-center flex-row gap-2 rounded-2xl bg-sketchTerracotta py-4 shadow-sm"
            >
              {saveState === "success" && (
                <Check size={18} color="#FFFFFF" weight="bold" />
              )}
              <Text className="font-semibold text-white">
                {saveState === "saving"
                  ? "Saving..."
                  : saveState === "success"
                    ? "Saved"
                    : "Save"}
              </Text>
            </AnimatedPressable>
          </View>
        ) : (
          <AnimatedPressable
            onPress={() => toggleEdit(true)}
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-sketchTerracotta py-4 shadow-sm"
          >
            <PencilSimple size={18} color="#FFFFFF" weight="bold" />
            <Text className="font-semibold text-white">Edit Profile</Text>
          </AnimatedPressable>
        )}
      </View>

      {/* KARTU AKUN & CLOUD SYNC */}
      <Animated.View
        entering={FadeInDown.duration(400).delay(200)}
        className="mb-6 rounded-2xl border border-gray-100 bg-sketchCard p-5 shadow-sm"
      >
        <View className="mb-3 flex-row items-center gap-2">
          {/* 🚀 ICON CLOUD */}
          <Cloud size={16} color="#7F8C8D" weight="bold" />
          <Text className="text-xs font-bold tracking-wider text-sketchMuted">
            CLOUD BACKUP
          </Text>
          {user && (
            <View className="flex-row items-center gap-1 ml-auto">
              <Animated.View
                style={cloudDotStyle}
                className="h-2 w-2 rounded-full bg-green-500"
              />
              <Text className="text-xs text-green-600">Connected</Text>
            </View>
          )}
        </View>

        {user ? (
          <View>
            <Text className="text-sm text-sketchMuted mb-1">
              Tersinkronisasi dengan:
            </Text>
            <Text className="text-base font-semibold text-sketchCharcoal mb-4">
              {user.email}
            </Text>
            <AnimatedPressable
              onPress={handleLogout}
              className="items-center rounded-xl border border-red-400 py-3"
            >
              <Text className="font-semibold text-red-500">
                Keluar (Logout)
              </Text>
            </AnimatedPressable>

            <AnimatedPressable
              onPress={async () => {
                Alert.alert("Sinkronisasi", "Sedang mencadangkan resep...");
                const result = await syncRecipesToCloud();
                Alert.alert("Status", result.message);
              }}
              className="mt-3 items-center rounded-xl bg-sketchTerracotta py-3"
            >
              <Text className="font-semibold text-white">
                Synchronize Recipes
              </Text>
            </AnimatedPressable>

            <AnimatedPressable
              onPress={async () => {
                Alert.alert(
                  "Impor dari Cloud",
                  "Mengambil resep yang sudah dicadangkan...",
                );
                const result = await importRecipesFromCloud();
                if (result.success) loadProfile();
                Alert.alert("Status", result.message);
              }}
              className="mt-3 flex-row items-center justify-center gap-2 rounded-xl border border-sketchTerracotta py-3"
            >
              <CloudArrowDown color="#E07A5F" size={18} weight="bold" />
              <Text className="font-semibold text-sketchTerracotta">
                Impor dari Cloud
              </Text>
            </AnimatedPressable>
          </View>
        ) : (
          <View>
            <Text className="text-sm text-sketchMuted mb-4">
              Login untuk mencadangkan resepmu secara permanen ke server.
            </Text>
            <AnimatedPressable
              onPress={() => router.push("/auth")}
              className="items-center rounded-xl bg-sketchCharcoal py-3"
            >
              <Text className="font-semibold text-white">
                Masuk / Daftar Akun
              </Text>
            </AnimatedPressable>
          </View>
        )}
      </Animated.View>

      {/* 🚀 KEJUTAN EASTER EGG dengan Phosphor Icon */}
      {isBirthdayToday && !isEditing && (
        <Animated.View
          entering={FadeInDown.duration(400).delay(300)}
          className="mt-4 mb-20 items-center justify-center"
        >
          <View className="flex-row items-center gap-2 mb-2">
            <Sparkle size={14} color="#7F8C8D" weight="fill" />
            <Text className="text-xs font-bold text-sketchMuted tracking-widest">
              psst... ada yang ngintip
            </Text>
            <Eye size={14} color="#7F8C8D" weight="fill" />
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push("/rahasia-ulang-tahun")}
            className="p-2"
          >
            <Image
              source={require("../../../assets/gif/cat-black.gif")}
              className="w-40 h-40"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Animated.View>
      )}

      <View className="h-10" />
    </Animated.ScrollView>
  );
}
