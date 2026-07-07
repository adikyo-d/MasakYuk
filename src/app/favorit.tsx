import { Heart } from "phosphor-react-native";
import { Text, View } from "react-native";

export default function FavoritesScreen() {
  return (
    <View className="flex-1 bg-sketchBg px-4 pt-14">
      <Text className="text-2xl font-bold text-sketchCharcoal">
        Favorites
      </Text>
      <Text className="mt-0.5 text-sm text-sketchMuted">
        Recipes you have saved
      </Text>

      <View className="mt-10 items-center rounded-2xl bg-sketchCard p-8">
        <Heart color="#E07A5F" size={44} weight="duotone" />
        <Text className="mt-4 text-center text-base font-semibold text-sketchCharcoal">
          No favorites yet
        </Text>
        <Text className="mt-2 text-center text-sm text-sketchMuted">
          Save your favorite recipes so they are easy to find later.
        </Text>
      </View>
    </View>
  );
}
