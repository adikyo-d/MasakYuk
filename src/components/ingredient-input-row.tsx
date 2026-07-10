import { X } from "phosphor-react-native";
import { Pressable, TextInput, View } from "react-native";

type Props = {
  name: string;
  amount: string;
  onChangeName: (v: string) => void;
  onChangeAmount: (v: string) => void;
  onRemove: () => void;
};

export default function IngredientInputRow({
  name,
  amount,
  onChangeName,
  onChangeAmount,
  onRemove,
}: Props) {
  return (
    <View className="flex-row items-center gap-2 mb-2">
      <TextInput
        value={name}
        onChangeText={onChangeName}
        placeholder="Nama bahan"
        placeholderTextColor="#7F8C8D"
        className="flex-1 bg-sketchBg rounded-xl border-[0.2px] px-3 py-2.5 text-sketchCharcoal"
      />
      <TextInput
        value={amount}
        onChangeText={onChangeAmount}
        placeholder="Takaran"
        placeholderTextColor="#7F8C8D"
        className="w-24 bg-sketchBg rounded-xl px-3 border-[0.2px] py-2.5 text-sketchCharcoal"
      />
      <Pressable onPress={onRemove} className="p-1">
        <X color="#7F8C8D" size={18} weight="bold" />
      </Pressable>
    </View>
  );
}
