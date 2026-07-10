import { MagnifyingGlass } from "phosphor-react-native";
import { Text, View } from "react-native";

export default function ExploreScreen() {
  return (
    <View className="flex-1 bg-sketchBg px-4 pt-14">
      <Text className="text-2xl font-bold text-sketchCharcoal">Explore</Text>
      <Text className="mt-0.5 text-sm text-sketchMuted">
        Find fresh recipe inspiration
      </Text>

      <View className="mt-10 items-center rounded-2xl bg-sketchCard p-8">
        <MagnifyingGlass color="#E07A5F" size={44} weight="duotone" />
        <Text className="mt-4 text-center text-base font-semibold text-sketchCharcoal">
          Coming Soon
        </Text>
        <Text className="mt-2 text-center text-sm text-sketchMuted">
          Public recipe discovery is still in development.
        </Text>
      </View>
    </View>
  );
}
