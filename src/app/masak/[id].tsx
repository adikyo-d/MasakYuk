import { getRecipeDetail, incrementCookCount } from "@/database/recipes";
import { cleanupAudio, playSuccess, playTimerDone } from "@/utils/audio";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import {
    CaretLeft,
    CaretRight,
    CheckCircle,
    CookingPot,
    Pause,
    Play,
    X,
} from "phosphor-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function CookingModeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipeId = Number(id);
  const { recipe, steps } = getRecipeDetail(recipeId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animation states
  const [showSuccess, setShowSuccess] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Reset state when screen is focused (solves the bug where it resumes from last step)
  useFocusEffect(
    useCallback(() => {
      setCurrentIndex(0);
      setRemaining(steps[0]?.duration_seconds ?? 0);
      setIsRunning(false);
      setShowSuccess(false);
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
      if (intervalRef.current) clearInterval(intervalRef.current);

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }, [recipeId]),
  );

  const currentStep = steps[currentIndex];
  const isLastStep = currentIndex === steps.length - 1;
  const hasTimer = currentStep?.has_timer === 1;

  useEffect(() => {
    activateKeepAwakeAsync();
    return () => {
      deactivateKeepAwake();
      cleanupAudio();
    };
  }, []);

  // Reset timer setiap pindah langkah
  useEffect(() => {
    setRemaining(currentStep?.duration_seconds ?? 0);
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [currentIndex]);

  // Jalankan countdown
  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            playTimerDone();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const goNext = useCallback(() => {
    if (isLastStep) {
      incrementCookCount(recipeId);
      setShowSuccess(true);
      playSuccess();

      // Start Animation
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setShowSuccess(false);
            router.back();
          });
        }, 2000);
      });
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [isLastStep, recipeId, scaleAnim, opacityAnim]);

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  if (!currentStep) {
    return (
      <View className="flex-1 bg-sketchBg items-center justify-center px-4">
        <View className="items-center rounded-2xl bg-sketchCard p-8">
          <CookingPot color="#E07A5F" size={44} weight="duotone" />
          <Text className="mt-4 text-center text-base font-semibold text-sketchCharcoal">
            Resep ini belum punya langkah
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-sketchCharcoal px-6 pt-14">
      {/* Header: tombol tutup + progress */}
      <View className="flex-row items-center justify-between mb-6">
        <Pressable onPress={() => router.back()}>
          <X color="#FDFBF7" size={26} weight="bold" />
        </Pressable>
        <Text className="text-sketchBg/70 text-sm">
          Langkah {currentIndex + 1} dari {steps.length}
        </Text>
      </View>

      {/* Progress bar */}
      <View className="h-1.5 bg-white/20 rounded-full mb-10 overflow-hidden">
        <View
          className="h-full bg-sketchTerracotta rounded-full"
          style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
        />
      </View>

      {/* Instruksi langkah saat ini */}
      <Text className="text-sketchBg text-2xl font-bold leading-9 mb-8">
        {currentStep.instruction}
      </Text>

      {/* Timer besar, hanya muncul kalau step ini butuh timer */}
      {hasTimer && (
        <View className="items-center mb-10">
          <Text className="text-sketchTerracotta text-6xl font-bold mb-4">
            {formatTime(remaining)}
          </Text>

          {remaining > 0 ? (
            <Pressable
              onPress={() => setIsRunning(!isRunning)}
              className="flex-row items-center gap-2 bg-sketchTerracotta rounded-full px-8 py-3"
            >
              {isRunning ? (
                <Pause color="#FFFFFF" size={18} weight="fill" />
              ) : (
                <Play color="#FFFFFF" size={18} weight="fill" />
              )}
              <Text className="text-white font-bold">
                {isRunning ? "Jeda Timer" : "Mulai Timer"}
              </Text>
            </Pressable>
          ) : (
            <View className="flex-row items-center gap-2">
              <CheckCircle color="#81B29A" size={20} weight="fill" />
              <Text className="text-sketchSage font-semibold">
                Waktu selesai!
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Navigasi bawah */}
      <View className="mt-auto mb-10 flex-row gap-3">
        {currentIndex > 0 && (
          <Pressable
            onPress={goPrev}
            className="flex-1 flex-row items-center justify-center gap-1 border border-white/30 rounded-2xl py-4"
          >
            <CaretLeft color="#FDFBF7" size={16} weight="bold" />
            <Text className="text-sketchBg font-semibold">Kembali</Text>
          </Pressable>
        )}
        <Pressable
          onPress={goNext}
          className="flex-1 flex-row items-center justify-center gap-1 bg-sketchTerracotta rounded-2xl py-4"
        >
          <Text className="text-white font-bold">
            {isLastStep ? "Selesai Masak" : "Langkah Berikutnya"}
          </Text>
          {isLastStep ? (
            <CookingPot color="#FFFFFF" size={18} weight="duotone" />
          ) : (
            <CaretRight color="#FFFFFF" size={16} weight="bold" />
          )}
        </Pressable>
      </View>

      {/* Success Animation Overlay */}
      {showSuccess && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              justifyContent: "center",
              alignItems: "center",
              opacity: opacityAnim,
              zIndex: 50,
            },
          ]}
        >
          <Animated.View
            style={{
              transform: [{ scale: scaleAnim }],
              alignItems: "center",
              backgroundColor: "#E07A5F",
              padding: 30,
              borderRadius: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 10,
              maxWidth: "85%",
            }}
          >
            <CookingPot color="#FFFFFF" size={80} weight="duotone" />
            <Text className="mt-4 text-3xl font-bold text-white text-center">
              Selamat Menikmati!
            </Text>
            <Text className="mt-2 text-white/90 text-center font-medium">
              Kamu telah berhasil menyelesaikan resep ini.
            </Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}
