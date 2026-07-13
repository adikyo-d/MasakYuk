import { supabase } from "@/lib/supabase";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { Eye, EyeClosed, Lock, ShieldCheck } from "phosphor-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

function validatePassword(pwd: string): string | null {
  if (pwd.length < 8) return "Password minimal 8 karakter.";
  if (!/\d/.test(pwd)) return "Password harus mengandung minimal 1 angka.";
  return null;
}

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    handleDeepLink();
  }, []);

  async function handleDeepLink() {
    try {
      const url = await Linking.getInitialURL();

      if (url) {
        const hashIndex = url.indexOf("#");
        if (hashIndex !== -1) {
          const hashParams = new URLSearchParams(url.substring(hashIndex + 1));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (accessToken && refreshToken) {
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (!error) {
              setSessionReady(true);
              setLoading(false);
              return;
            }
          }
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setSessionReady(true);
      }
    } catch (err) {
      console.error("Deep link error:", err);
    } finally {
      setLoading(false);
    }
  }

  const passwordError = password.length > 0 ? validatePassword(password) : null;
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const canSubmit =
    !passwordError && password.length >= 8 && passwordsMatch && !loading;

  async function handleResetPassword() {
    const error = validatePassword(password);
    if (error) {
      Alert.alert("Password Tidak Valid", error);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Tidak Cocok",
        "Password dan konfirmasi password tidak sama.",
      );
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      Alert.alert("Gagal", updateError.message);
    } else {
      Alert.alert(
        "Berhasil!",
        "Password berhasil diubah. Silakan login dengan password baru.",
        [{ text: "OK", onPress: () => router.replace("/auth") }],
      );
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-sketchBg">
        <ActivityIndicator size="large" color="#E07A5F" />
        <Text className="mt-4 text-sketchMuted">Memverifikasi link...</Text>
      </View>
    );
  }

  if (!sessionReady) {
    return (
      <View className="flex-1 justify-center px-6 bg-sketchBg">
        <View className="items-center mb-8">
          <ShieldCheck color="#E07A5F" size={48} weight="duotone" />
          <Text className="text-xl font-bold text-sketchCharcoal mt-4 text-center">
            Link Tidak Valid
          </Text>
          <Text className="text-sm text-sketchMuted mt-2 text-center">
            Link reset password sudah kedaluwarsa atau tidak valid. Silakan
            minta link baru dari halaman login.
          </Text>
        </View>
        <TouchableOpacity
          className="bg-sketchTerracotta py-4 rounded-xl items-center"
          onPress={() => router.replace("/auth")}
        >
          <Text className="font-bold text-white text-lg">Kembali ke Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center px-6 bg-sketchBg">
      <View className="items-center mb-6">
        <ShieldCheck color="#E07A5F" size={48} weight="duotone" />
        <Text className="text-2xl font-bold text-sketchCharcoal mt-3">
          Atur Ulang Password
        </Text>
        <Text className="text-sm text-sketchMuted mt-1 text-center">
          Buat password baru untuk akunmu.
        </Text>
      </View>

      {/* Syarat Password */}
      <View className="bg-sketchCard rounded-xl p-4 mb-6 border border-gray-100">
        <Text className="text-xs font-bold text-sketchMuted mb-2 tracking-wider">
          SYARAT PASSWORD
        </Text>
        <View className="flex-row items-center gap-2 mb-1">
          <View
            className={`w-2 h-2 rounded-full ${password.length >= 8 ? "bg-green-500" : "bg-gray-300"}`}
          />
          <Text
            className={`text-sm ${password.length >= 8 ? "text-green-600" : "text-sketchMuted"}`}
          >
            Minimal 8 karakter
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View
            className={`w-2 h-2 rounded-full ${/\d/.test(password) ? "bg-green-500" : "bg-gray-300"}`}
          />
          <Text
            className={`text-sm ${/\d/.test(password) ? "text-green-600" : "text-sketchMuted"}`}
          >
            Mengandung minimal 1 angka
          </Text>
        </View>
      </View>

      {/* Password Baru */}
      <View className="flex-row items-center bg-white px-4 py-3 rounded-xl mb-4 border border-gray-200">
        <Lock color="#7F8C8D" size={20} />
        <TextInput
          className="flex-1 ml-3 text-sketchCharcoal"
          placeholder="Password baru"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#7F8C8D"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          {showPassword ? (
            <EyeClosed color="#7F8C8D" size={20} />
          ) : (
            <Eye color="#7F8C8D" size={20} />
          )}
        </TouchableOpacity>
      </View>

      {/* Konfirmasi Password */}
      <View className="flex-row items-center bg-white px-4 py-3 rounded-xl mb-2 border border-gray-200">
        <Lock color="#7F8C8D" size={20} />
        <TextInput
          className="flex-1 ml-3 text-sketchCharcoal"
          placeholder="Konfirmasi password baru"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirm}
          placeholderTextColor="#7F8C8D"
        />
        <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
          {showConfirm ? (
            <EyeClosed color="#7F8C8D" size={20} />
          ) : (
            <Eye color="#7F8C8D" size={20} />
          )}
        </TouchableOpacity>
      </View>

      {/* Match indicator */}
      {confirmPassword.length > 0 && (
        <Text
          className={`text-xs mb-6 ml-1 ${passwordsMatch ? "text-green-600" : "text-red-500"}`}
        >
          {passwordsMatch ? "Password cocok" : "Password tidak cocok"}
        </Text>
      )}
      {confirmPassword.length === 0 && <View className="mb-6" />}

      <TouchableOpacity
        className={`py-4 rounded-xl items-center ${canSubmit ? "bg-sketchTerracotta" : "bg-gray-300"}`}
        onPress={handleResetPassword}
        disabled={!canSubmit}
      >
        <Text className="font-bold text-white text-lg">
          Simpan Password Baru
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4 items-center"
        onPress={() => router.replace("/")}
      >
        <Text className="font-semibold text-sketchMuted">Batal</Text>
      </TouchableOpacity>
    </View>
  );
}
