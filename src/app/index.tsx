import {
    FlatList,
    Image,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const MOCK_RECIPES = [
  {
    id: "1",
    title: "Creamy Carbonara",
    duration: "20 Min",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500",
  },
  {
    id: "2",
    title: "Strawberry Cake",
    duration: "45 Min",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500",
  },
];

export default function BerandaScreen() {
  return (
    <View className="flex-1 bg-sketchBg px-4 pt-14">
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-bold text-sketchCharcoal">
            Halo, Chef Fani 😺
          </Text>
          <Text className="text-sm text-sketchMuted mt-0.5">
            Mau masak apa hari ini?
          </Text>
        </View>
        <TouchableOpacity className="w-10 h-10 bg-sketchTerracotta rounded-full items-center justify-center shadow-sm">
          <Text className="text-white font-bold">SC</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Cari resep rahasiamu..."
        placeholderTextColor="#7F8C8D"
        className="w-full bg-sketchCard border border-gray-100 rounded-2xl p-3.5 mt-5 shadow-sm text-sketchCharcoal"
      />

      <FlatList
        data={MOCK_RECIPES}
        numColumns={2}
        className="mt-6"
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity className="flex-1 bg-sketchCard m-1.5 p-3 rounded-2xl border border-gray-50 shadow-md">
            <View className="w-full h-32 rounded-xl bg-gray-100 mb-2 overflow-hidden">
              <Image
                source={{ uri: item.image }}
                className="w-full h-full object-cover"
              />
            </View>
            <Text
              className="text-sm font-bold text-sketchCharcoal"
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text className="text-xs text-sketchMuted mt-1">
              ⏱️ {item.duration}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
