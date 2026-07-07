import { Timer } from "phosphor-react-native";
import { Text, View } from "react-native";

type Props = {
  order: number;
  instruction: string;
  hasTimer: boolean;
  durationSeconds: number;
};

function formatMinutes(sec: number) {
  const m = Math.floor(sec / 60);
  return `${m} menit`;
}

export default function StepPreviewRow({
  order,
  instruction,
  hasTimer,
  durationSeconds,
}: Props) {
  return (
    <View className="flex-row items-start py-3 border-b border-gray-100">
      <View className="w-7 h-7 rounded-full bg-sketchTerracotta items-center justify-center mr-3">
        <Text className="text-white text-xs font-bold">{order}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-sketchCharcoal">{instruction}</Text>
        {hasTimer && (
          <View className="flex-row items-center mt-1">
            <Timer color="#81B29A" size={14} weight="bold" />
            <Text className="text-sketchSage text-xs ml-1">
              {formatMinutes(durationSeconds)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
