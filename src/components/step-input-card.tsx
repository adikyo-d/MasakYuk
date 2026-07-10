import { X } from "phosphor-react-native";
import { Pressable, Switch, Text, TextInput, View } from "react-native";

type Props = {
  order: number;
  instruction: string;
  hasTimer: boolean;
  durationSeconds: string; // input mentah sebagai string
  onChangeInstruction: (v: string) => void;
  onToggleTimer: (v: boolean) => void;
  onChangeDuration: (v: string) => void;
  onRemove: () => void;
};

export default function StepInputCard({
  order,
  instruction,
  hasTimer,
  durationSeconds,
  onChangeInstruction,
  onToggleTimer,
  onChangeDuration,
  onRemove,
}: Props) {
  return (
    <View className="bg-sketchCard rounded-2xl border-[0.2px] p-4 mb-3 shadow-sm">
      <View className="flex-row items-start justify-between mb-2">
        <View className="w-7 h-7 rounded-full bg-sketchSage items-center justify-center">
          <Text className="text-white text-xs font-bold">{order}</Text>
        </View>
        <Pressable onPress={onRemove}>
          <X color="#7F8C8D" size={16} weight="bold" />
        </Pressable>
      </View>

      <TextInput
        value={instruction}
        onChangeText={onChangeInstruction}
        placeholder="Jelaskan langkah memasak..."
        placeholderTextColor="#7F8C8D"
        multiline
        className="text-sketchCharcoal border-[0.2px] rounded-2xl min-h-[60px] mb-3"
        textAlignVertical="top"
      />

      <View className="flex-row items-center justify-between border-t border-gray-100 pt-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-sketchMuted text-xs">Jadikan Timer</Text>
          <Switch
            value={hasTimer}
            onValueChange={onToggleTimer}
            trackColor={{ true: "#E07A5F" }}
          />
        </View>

        {hasTimer && (
          <View className="flex-row items-center gap-1">
            <TextInput
              value={durationSeconds}
              onChangeText={onChangeDuration}
              keyboardType="number-pad"
              placeholder="0"
              className="bg-sketchBg rounded-lg border-[0.2px] px-2 py-1 w-16 text-center text-sketchCharcoal"
            />
            <Text className="text-sketchMuted text-xs">detik</Text>
          </View>
        )}
      </View>
    </View>
  );
}
