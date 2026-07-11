import { Sparkle, Globe } from "phosphor-react-native";
import { ScrollView, Text, View } from "react-native";
import YoutubeAiCard from "@/components/youtube-ai-card";

export default function ExploreScreen() {
  return (
    <ScrollView
      className="flex-1 bg-sketchBg px-4 pt-14"
      showsVerticalScrollIndicator={false}
    >
      <View className="mb-1 flex-row items-center gap-2">
        <Sparkle color="#E07A5F" size={24} weight="duotone" />
        <Text className="text-2xl font-bold text-sketchCharcoal">Jelajah</Text>
      </View>
      <Text className="mb-5 text-sm text-sketchMuted">
        Fitur-fitur pintar yang butuh koneksi internet.
      </Text>

      <YoutubeAiCard />

      <View className="mb-10 mt-4 items-center rounded-2xl border border-dashed border-sketchSage p-6">
        <Globe color="#81B29A" size={32} weight="duotone" />
        <Text className="mt-2 text-center text-sm font-semibold text-sketchSage">
          Lebih banyak fitur segera hadir
        </Text>
        <Text className="mt-1 text-center text-xs text-sketchMuted">
          Rekomendasi resep trending, import dari link web, dan lainnya.
        </Text>
      </View>
    </ScrollView>
  );
}
