import { AuthProvider } from "@/contexts/AuthContext";
import { initDatabase } from "@/database/schema";
import { supabase } from "@/lib/supabase";
import * as Linking from "expo-linking";
import { router, Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    try {
      initDatabase();
    } catch (e) {
      console.error("Database init failed:", e);
    } finally {
      setDbReady(true);
      SplashScreen.hideAsync();
    }
  }, []);

  useEffect(() => {
    if (!dbReady) return;

    function handleResetUrl(url: string) {
      // 1. Cari letak tanda "#" di URL
      const hashIndex = url.indexOf("#");
      if (hashIndex === -1) return;

      // 2. Ekstrak parameter setelah tanda "#"
      const params = new URLSearchParams(url.substring(hashIndex + 1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      // 3. Tangkap URL bertipe recovery (reset password)
      if (type === "recovery" || url.includes("reset-password")) {
        if (accessToken && refreshToken) {
          // Set sesi pengguna menggunakan token dari URL
          supabase.auth
            .setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            })
            .then(() => {
              // 🚀 FIX: Gunakan jeda 800ms agar AuthContext selesai melempar user ke Beranda.
              // Setelah Beranda terbuka, kita tembak paksa ke halaman reset-password.
              setTimeout(() => {
                router.push("/reset-password"); // Gunakan PUSH, bukan REPLACE
              }, 800);
            });
        }
      }
    }

    Linking.getInitialURL().then((url) => {
      if (url) handleResetUrl(url);
    });

    const sub = Linking.addEventListener("url", (event) =>
      handleResetUrl(event.url),
    );
    return () => sub.remove();
  }, [dbReady]);

  if (!dbReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* 2. Bungkus navigasi utama dengan AuthProvider */}
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="[id]"
            options={{ animation: "slide_from_right" }}
          />
          <Stack.Screen
            name="masak/[id]"
            options={{
              presentation: "fullScreenModal",
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="rahasia-ulang-tahun"
            options={{
              presentation: "fullScreenModal",
              animation: "fade",
              headerShown: false,
            }}
          />

          {/* 3. Daftarkan halaman otentikasi (Login/Register) */}
          <Stack.Screen
            name="auth"
            options={{
              presentation: "modal", // Muncul dari bawah seperti pop-up
              animation: "slide_from_bottom",
            }}
          />
          <Stack.Screen
            name="import/[code]"
            options={{ animation: "slide_from_bottom" }}
          />
          <Stack.Screen
            name="import-code"
            options={{ presentation: "modal", animation: "slide_from_bottom" }}
          />
          <Stack.Screen
            name="reset-password"
            options={{ presentation: "modal", animation: "slide_from_bottom" }}
          />
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
