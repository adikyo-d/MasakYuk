import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { EnvelopeSimple, Lock } from "phosphor-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      Alert.alert("Gagal Masuk", error.message);
    } else {
      router.back(); // Kembali ke halaman sebelumnya setelah sukses
    }
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      Alert.alert("Gagal Daftar", error.message);
    } else {
      Alert.alert("Berhasil!", "Akun berhasil dibuat. Silakan login.");
    }
    setLoading(false);
  };

  // Logika baru untuk reset password
  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert(
        "Email Dibutuhkan",
        "Silakan ketik email kamu di kolom pengisian terlebih dahulu.",
      );
      return;
    }

    setLoading(true);
    // Mengirim email reset ke user
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "masakyuk://reset-password", // Mengarahkan kembali ke aplikasi
    });

    if (error) {
      Alert.alert("Gagal Mengirim Link", error.message);
    } else {
      Alert.alert(
        "Cek Email Kamu",
        "Link untuk mengatur ulang password telah dikirim.",
      );
    }
    setLoading(false);
  };

  return (
    <View className="flex-1 justify-center px-6 bg-sketchBg">
      <Text className="text-3xl font-bold text-center mb-2 text-sketchCharcoal">
        MasakYuk
      </Text>
      <Text className="text-center text-sketchMuted mb-8">
        Simpan dan sinkronkan resepmu di cloud.
      </Text>

      <View className="flex-row items-center bg-white px-4 py-3 rounded-xl mb-4 border border-gray-200">
        <EnvelopeSimple color="#7F8C8D" size={20} />
        <TextInput
          className="flex-1 ml-3 text-sketchCharcoal"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View className="flex-row items-center bg-white px-4 py-3 rounded-xl mb-8 border border-gray-200">
        <Lock color="#7F8C8D" size={20} />
        <TextInput
          className="flex-1 ml-3 text-sketchCharcoal"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#E07A5F" />
      ) : (
        <View className="flex-col gap-3">
          <TouchableOpacity
            className="bg-sketchTerracotta py-4 rounded-xl items-center"
            onPress={handleLogin}
          >
            <Text className="font-bold text-white text-lg">Masuk</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="py-4 rounded-xl items-center border border-sketchTerracotta"
            onPress={handleSignUp}
          >
            <Text className="font-bold text-sketchTerracotta text-lg">
              Buat Akun Baru
            </Text>
          </TouchableOpacity>

          {/* Tombol Lupa Password */}
          <TouchableOpacity
            className="mt-4 items-center"
            onPress={handleResetPassword}
          >
            <Text className="font-semibold text-sketchMuted">
              Lupa Password?
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
