import { Check } from "phosphor-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

type Props = { name: string; amount: string };

export default function IngredientRow({ name, amount }: Props) {
  const [checked, setChecked] = useState(false);

  return (
    <Pressable
      onPress={() => setChecked(!checked)}
      className="flex-row items-center py-3 border-b border-gray-100"
    >
      <View
        className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${
          checked ? "bg-sketchSage border-sketchSage" : "border-sketchMuted"
        }`}
      >
        {checked && <Check color="#FFFFFF" size={14} weight="bold" />}
      </View>
      <Text
        className={`flex-1 text-sketchCharcoal ${
          checked ? "line-through text-sketchMuted" : ""
        }`}
      >
        {name}
      </Text>
      <Text className="text-sketchMuted text-sm">{amount}</Text>
    </Pressable>
  );
}
