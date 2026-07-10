import { useEffect, useMemo, useState } from "react";
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
  ...rest
}: Props) {
  const [displayed, setDisplayed] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const characters = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    setDisplayed("");
    setIsDone(false);
    let index = 0;

    const interval = setInterval(() => {
      if (index < characters.length) {
        if (characters[index]) {
          setDisplayed((prev) => prev + characters[index]);
        }
        index += 1;
      } else {
        clearInterval(interval);
        setIsDone(true);
        onDone?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [characters, speed, onDone]);

  // Kursor berkedip terus selama proses ngetik & sesaat setelah selesai
  useEffect(() => {
    const blink = setInterval(() => setShowCursor((v) => !v), 450);
    return () => clearInterval(blink);
  }, []);

  return (
    <Text {...rest}>
      {displayed}
      {!isDone && <Text style={{ opacity: showCursor ? 1 : 0 }}>▌</Text>}
    </Text>
  );
}
