import { useEffect, useMemo, useRef, useState } from "react";
import { Text, TextProps } from "react-native";

type Props = TextProps & {
  text: string;
  speed?: number;
  onDone?: () => void;
};

export default function TypewriterText({
  text,
  speed = 40,
  onDone,
  style,
  ...rest
}: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  // Mengamankan emoji dengan mengubah string menjadi Array
  const chars = useMemo(() => Array.from(text), [text]);

  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  // Jalankan animasi ketik — HANYA update index di sini, tanpa efek samping lain
  useEffect(() => {
    setCurrentIndex(0); // Selalu mulai dari 0 saat text berubah

    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= chars.length) {
          clearInterval(timer);
          return prev; // 🚀 cuma return, TIDAK manggil onDone di sini
        }
        return prev + 1;
      });
    }, speed);

    return () => clearInterval(timer);
  }, [chars, speed]);

  useEffect(() => {
    if (chars.length > 0 && currentIndex >= chars.length) {
      onDoneRef.current?.();
    }
  }, [currentIndex, chars.length]);

  // Kursor berkedip
  useEffect(() => {
    const blink = setInterval(() => setShowCursor((v) => !v), 450);
    return () => clearInterval(blink);
  }, []);

  // Rahasia tanpa bug: Selalu memotong kalimat asli, bukan menyambung huruf baru
  const displayedText = chars.slice(0, currentIndex).join("");
  const isDone = currentIndex >= chars.length;

  return (
    <Text style={style} {...rest}>
      {displayedText}
      {!isDone && (
        <Text style={{ opacity: showCursor ? 1 : 0, fontWeight: "bold" }}>
          ▌
        </Text>
      )}
    </Text>
  );
}
