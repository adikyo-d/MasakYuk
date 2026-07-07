import { getProfile, updateProfile } from "@/database/profile";
import { File, Directory, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

export default function ProfilScreen() {
  const [name, setName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, []),
  );

  function loadProfile() {
    const profile = getProfile();
    if (profile) {
      setName(profile.name);
      setBirthday(profile.birthday ?? "");
      setAvatarUri(profile.avatar);
    }
  }

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
    } catch {
      Alert.alert("Failed", "Could not save the photo. Please try again.");
    }
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

    setSaving(true);
    try {
      updateProfile(name.trim(), birthday || null, avatarUri ?? undefined);
      setIsEditing(false);
    } catch {
      Alert.alert("Failed", "Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <ScrollView className="flex-1 bg-sketchBg px-4 pt-14">
      <Text className="text-2xl font-bold text-sketchCharcoal">Profile</Text>
      <Text className="mt-0.5 text-sm text-sketchMuted">
        Manage your personal information
      </Text>

      <View className="mt-8 items-center">
        <TouchableOpacity
          onPress={pickAvatar}
          className="h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-sketchTerracotta shadow-lg"
          activeOpacity={0.7}
        >
          {avatarUri ? (
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
        </TouchableOpacity>
        <TouchableOpacity onPress={pickAvatar} className="mt-3">
          <Text className="text-sm font-medium text-sketchTerracotta">
            Change Photo
          </Text>
        </TouchableOpacity>
      </View>

      <View className="mt-8 rounded-2xl bg-sketchCard p-5 shadow-sm">
        <View className="mb-4">
          <Text className="mb-1.5 text-xs font-medium text-sketchMuted">
            NAME
          </Text>
          {isEditing ? (
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor="#7F8C8D"
              className="rounded-xl border border-gray-200 bg-sketchBg px-4 py-3 text-base text-sketchCharcoal"
            />
          ) : (
            <Text className="text-lg font-semibold text-sketchCharcoal">
              {name}
            </Text>
          )}
        </View>

        <View className="mb-2 h-px bg-gray-100" />

        <View className="mt-4">
          <Text className="mb-1.5 text-xs font-medium text-sketchMuted">
            BIRTHDAY
          </Text>
          {isEditing ? (
            <TextInput
              value={birthday}
              onChangeText={setBirthday}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#7F8C8D"
              keyboardType={
                Platform.OS === "ios"
                  ? "numbers-and-punctuation"
                  : "default"
              }
              className="rounded-xl border border-gray-200 bg-sketchBg px-4 py-3 text-base text-sketchCharcoal"
            />
          ) : (
            <Text className="text-lg font-semibold text-sketchCharcoal">
              {birthday || "Not set"}
            </Text>
          )}
        </View>
      </View>

      <View className="mt-6 mb-10">
        {isEditing ? (
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => {
                setIsEditing(false);
                loadProfile();
              }}
              className="flex-1 items-center rounded-2xl border border-gray-200 bg-sketchCard py-4"
            >
              <Text className="font-semibold text-sketchMuted">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className="flex-1 items-center rounded-2xl bg-sketchTerracotta py-4 shadow-sm"
            >
              <Text className="font-semibold text-white">
                {saving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            className="items-center rounded-2xl bg-sketchTerracotta py-4 shadow-sm"
          >
            <Text className="font-semibold text-white">Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
