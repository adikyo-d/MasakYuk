import { initDatabase } from "@/database/schema";
import { Stack } from "expo-router";
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

  if (!dbReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="[id]" options={{ animation: "slide_from_right" }} />
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
      </Stack>
    </GestureHandlerRootView>
  );
}
