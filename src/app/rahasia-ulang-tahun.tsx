import PawTapGame from "@/components/paw-tap-game";
import TypewriterText from "@/components/typewriter-text";
import { getProfile } from "@/database/profile";
import { playBirthdayTheme, stopBirthdayTheme } from "@/utils/audio";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { CatIcon, ChefHat, Moon, PaperPlaneTilt } from "phosphor-react-native";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Linking,
    Pressable,
    Text,
    View,
} from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

type Stage = "dialog" | "rhythm" | "loading404" | "cake";

const YOUR_WHATSAPP_NUMBER = "6285338128436";
const { width, height } = Dimensions.get("window");

function TwinklingStar({
  top,
  left,
  size,
}: {
  top: number;
  left: number;
  size: number;
}) {
  const opacity = useRef(new Animated.Value(Math.random())).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: Math.random() * 0.7 + 0.3,
          duration: 1200 + Math.random() * 1800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: Math.random() * 0.2,
          duration: 1200 + Math.random() * 1800,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    animate();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        top,
        left,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#FFFFFF",
        opacity,
      }}
    />
  );
}

export default function SecretBirthdayScreen() {
  const [stage, setStage] = useState<Stage>("dialog");
  const [dialogDone, setDialogDone] = useState(false);

  const profile = getProfile();
  const name = profile?.name ?? "Chef";
  const message = `Halo Broski ${name} 🌙\n\nDi antara semua resep dan kue yang kamu buat,\nada satu resep yang nggak pernah gagal:\nresep bikin orang di sekitarmu ikut bahagia.(Ngasih gw contohnya)\n\nHbd aja si. Semoga tahun ini\nsehangat kue keluar dari oven,\ndan setenang malam berbintang.(rekomendasi kata AI)`;

  const catEntrance = useRef(new Animated.Value(0)).current;
  const dialogEntrance = useRef(new Animated.Value(0)).current;
  const flashOpacity = useRef(new Animated.Value(0)).current;
  const cakeEntrance = useRef(new Animated.Value(0)).current;
  const moonGlow = useRef(new Animated.Value(0.6)).current;

  const stars = useRef(
    Array.from({ length: 40 }).map(() => ({
      top: Math.random() * height,
      left: Math.random() * width,
      size: Math.random() * 2 + 1,
    })),
  ).current;

  // 🎵 Musik tema mulai begitu halaman ini dibuka, berhenti saat keluar
  useEffect(() => {
    playBirthdayTheme();
    return () => {
      stopBirthdayTheme();
    };
  }, []);

  // Glow bulan berdenyut pelan, terus-menerus
  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(moonGlow, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(moonGlow, {
          toValue: 0.6,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  useEffect(() => {
    if (stage === "dialog") {
      Animated.spring(catEntrance, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
      }).start();
      Animated.timing(dialogEntrance, {
        toValue: 1,
        duration: 500,
        delay: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [stage]);

  useEffect(() => {
    if (stage === "loading404") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      flashOpacity.setValue(1);
      Animated.timing(flashOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
    if (stage === "cake") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      flashOpacity.setValue(1);
      Animated.timing(flashOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start();
      cakeEntrance.setValue(0);
      Animated.spring(cakeEntrance, {
        toValue: 1,
        useNativeDriver: true,
        friction: 4,
        delay: 150,
      }).start();
    }
  }, [stage]);

  const handleRhythmComplete = () => {
    setStage("loading404");
    setTimeout(() => setStage("cake"), 2200);
  };

  const handleSendWhatsapp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const text = encodeURIComponent(
      `Aduhh dit! kamu mau di traktir apa? kopi sekarung? es kopi se galon? gas ayo aja beli semua 😎`,
    );
    Linking.openURL(`https://wa.me/${YOUR_WHATSAPP_NUMBER}?text=${text}`);
  };

  const handleLanjut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStage("rhythm");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0a1a" }}>
      <LinearGradient
        colors={["#1a1a2e", "#16213e", "#0f0e27", "#000000"]}
        style={{ flex: 1 }}
      >
        {/* Bintang latar */}
        <View
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          pointerEvents="none"
        >
          {stars.map((s, i) => (
            <TwinklingStar key={i} top={s.top} left={s.left} size={s.size} />
          ))}
        </View>

        {/* Bulan dengan glow */}
        <Animated.View
          style={{
            position: "absolute",
            top: 70,
            right: 40,
            opacity: moonGlow,
            shadowColor: "#F9E79F",
            shadowOpacity: 0.8,
            shadowRadius: 20,
          }}
        >
          <Moon color="#F9E79F" size={44} weight="fill" />
        </Animated.View>

        {/* KONTEN UTAMA — benar-benar center */}
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
        >
          {stage === "dialog" && (
            <View style={{ alignItems: "center", width: "100%" }}>
              <Animated.View
                style={{
                  opacity: catEntrance,
                  transform: [
                    {
                      scale: catEntrance.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                  ],
                }}
              >
                <CatIcon color="#F9C9D6" size={56} weight="duotone" />
              </Animated.View>

              <Animated.View
                style={{
                  opacity: dialogEntrance,
                  transform: [
                    {
                      translateY: dialogEntrance.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                  backgroundColor: "rgba(0,0,0,0.4)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.2)",
                  borderRadius: 16,
                  padding: 20,
                  marginTop: 24,
                  maxWidth: 360,
                }}
              >
                <TypewriterText
                  text={message}
                  speed={35}
                  onDone={() => setDialogDone(true)}
                  style={{ color: "white", fontSize: 15, lineHeight: 24 }}
                />
              </Animated.View>

              {dialogDone && (
                <Pressable
                  onPress={handleLanjut}
                  style={{
                    backgroundColor: "rgba(249,201,214,0.9)",
                    borderRadius: 999,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    marginTop: 28,
                  }}
                >
                  <Text style={{ color: "#1a1a2e", fontWeight: "bold" }}>
                    Lanjut ✨
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {stage === "rhythm" && (
            <PawTapGame onComplete={handleRhythmComplete} />
          )}

          {stage === "loading404" && (
            <View style={{ alignItems: "center", paddingHorizontal: 24 }}>
              <ChefHat color="#7F8C8D" size={48} weight="duotone" />
              <Text
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 11,
                  marginTop: 16,
                  letterSpacing: 2,
                }}
              >
                ERROR 404
              </Text>
              <Text
                style={{
                  color: "white",
                  fontSize: 18,
                  fontWeight: "bold",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Kue Ulang Tahun Tidak Ditemukan
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 12,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                Coba lagi tahun depan ya...
              </Text>
            </View>
          )}

          {stage === "cake" && (
            <Animated.View
              style={{
                alignItems: "center",
                opacity: cakeEntrance,
                transform: [
                  {
                    scale: cakeEntrance.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 1],
                    }),
                  },
                ],
              }}
            >
              <ConfettiCannon
                count={120}
                origin={{ x: width / 2, y: 0 }}
                fadeOut
                fallSpeed={2500}
              />
              <Text style={{ fontSize: 60, marginBottom: 16 }}>🎂</Text>
              <Text
                style={{
                  color: "white",
                  fontSize: 24,
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Selamat Ulang Tahun, broski {name}! 🌙
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 14,
                  textAlign: "center",
                  marginTop: 8,
                }}
              >
                Semoga harimu selembut cahaya bulan
              </Text>
              <Pressable
                onPress={handleSendWhatsapp}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  backgroundColor: "#25D366",
                  borderRadius: 999,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  marginTop: 40,
                }}
              >
                <PaperPlaneTilt color="#FFFFFF" size={18} weight="fill" />
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  chat ini kalau mau traktir....traktir kan ya?
                </Text>
              </Pressable>
            </Animated.View>
          )}
        </View>

        {/* Flash overlay */}
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "white",
            opacity: flashOpacity,
          }}
        />
      </LinearGradient>
    </View>
  );
}
