import * as Haptics from "expo-haptics";
import { PawPrint, SkullIcon } from "phosphor-react-native";
import { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Pressable, Text, View } from "react-native";

type Props = {
  onComplete: () => void;
};

const TOTAL_PAWS = 5;
const FALL_DURATION = 2600;
const SPAWN_INTERVAL = 750;
const { width, height } = Dimensions.get("window");
const PLAY_AREA_HEIGHT = height * 0.5;

type FallingPaw = {
  id: number;
  x: number;
  translateY: Animated.Value;
  scale: Animated.Value;
  caught: boolean;
};

export default function PawTapGame({ onComplete }: Props) {
  const [paws, setPaws] = useState<FallingPaw[]>([]);
  const [combo, setCombo] = useState(0);
  const [spawnedCount, setSpawnedCount] = useState(0);
  const [allDone, setAllDone] = useState(false);

  const [showFakeGameOver, setShowFakeGameOver] = useState(false);
  const [fakeGameOverDismissed, setFakeGameOverDismissed] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const gameOverEntrance = useRef(new Animated.Value(0)).current;

  // Spawn paw baru tiap interval, sampai total tercapai
  useEffect(() => {
    if (spawnedCount >= TOTAL_PAWS) return;

    const timeout = setTimeout(() => {
      const newPaw: FallingPaw = {
        id: Date.now() + Math.random(),
        x: 30 + Math.random() * (width - 100),
        translateY: new Animated.Value(-60),
        scale: new Animated.Value(1),
        caught: false,
      };

      setPaws((prev) => [...prev, newPaw]);
      setSpawnedCount((c) => c + 1);

      Animated.timing(newPaw.translateY, {
        toValue: PLAY_AREA_HEIGHT,
        duration: FALL_DURATION,
        useNativeDriver: true,
      }).start(() => {
        // Paw sampai bawah tanpa ditangkap — hilang begitu saja
        setPaws((prev) => prev.filter((p) => p.id !== newPaw.id));
      });
    }, SPAWN_INTERVAL);

    return () => clearTimeout(timeout);
  }, [spawnedCount]);

  // Cek apakah semua paw sudah selesai (spawn penuh + tidak ada yang tersisa di layar)
  useEffect(() => {
    if (spawnedCount >= TOTAL_PAWS && paws.length === 0 && !allDone) {
      setAllDone(true);
      setTimeout(() => setShowFakeGameOver(true), 400);
    }
  }, [paws, spawnedCount]);

  const handleCatch = (paw: FallingPaw) => {
    if (paw.caught) return;
    paw.caught = true;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCombo((c) => c + 1);

    // Animasi "pop" hilang saat ditangkap
    Animated.timing(paw.scale, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setPaws((prev) => prev.filter((p) => p.id !== paw.id));
    });
  };

  useEffect(() => {
    if (showFakeGameOver) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      gameOverEntrance.setValue(0);
      shakeAnim.setValue(0);

      Animated.parallel([
        Animated.spring(gameOverEntrance, {
          toValue: 1,
          useNativeDriver: true,
          friction: 5,
        }),
        Animated.sequence([
          Animated.timing(shakeAnim, {
            toValue: 10,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -10,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 8,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: -8,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(shakeAnim, {
            toValue: 0,
            duration: 60,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [showFakeGameOver]);

  const handleFakeRetry = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setFakeGameOverDismissed(true);
    setTimeout(onComplete, 1200);
  };

  if (showFakeGameOver) {
    return (
      <Animated.View
        style={{
          opacity: gameOverEntrance,
          transform: [
            {
              scale: gameOverEntrance.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1],
              }),
            },
            { translateX: shakeAnim },
          ],
        }}
        className="items-center px-6"
      >
        {!fakeGameOverDismissed ? (
          <>
            <SkullIcon color="#FF6B6B" size={64} weight="fill" />
            <Text className="text-red-400 text-2xl font-bold mt-4">
              GAME OVER
            </Text>
            <Text className="text-white/70 text-center mt-2 mb-8">
              Kamu cuma nangkep {combo} dari {TOTAL_PAWS} jejak kucing 💀{"\n"}
              (skill issue, bukan salah developer)
            </Text>
            <Pressable
              onPress={handleFakeRetry}
              className="bg-red-400/90 rounded-full px-6 py-3"
            >
              <Text className="text-white font-bold">Coba Lagi</Text>
            </Pressable>
          </>
        ) : (
          <Text className="text-pink-200 text-lg italic">
            just kidding... 🐾✨
          </Text>
        )}
      </Animated.View>
    );
  }

  return (
    <View
      className="items-center w-full"
      style={{ height: PLAY_AREA_HEIGHT + 80 }}
    >
      <Text className="text-white/80 text-sm mb-3 tracking-widest text-center">
        TANGKAP JEJAK KUCINGNYA SEBELUM JATUH ✨
      </Text>

      <View className="flex-row gap-3 mb-2">
        {Array.from({ length: TOTAL_PAWS }).map((_, i) => (
          <View
            key={i}
            className={`w-3 h-3 rounded-full ${i < combo ? "bg-pink-300" : "bg-white/20"}`}
          />
        ))}
      </View>

      {/* Play area — tempat paw jatuh */}
      <View
        style={{ width: width - 40, height: PLAY_AREA_HEIGHT }}
        className="relative"
      >
        {paws.map((paw) => (
          <Animated.View
            key={paw.id}
            style={{
              position: "absolute",
              left: paw.x,
              transform: [{ translateY: paw.translateY }, { scale: paw.scale }],
            }}
          >
            <Pressable onPress={() => handleCatch(paw)} hitSlop={16}>
              <PawPrint color="#F9C9D6" size={44} weight="fill" />
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}
