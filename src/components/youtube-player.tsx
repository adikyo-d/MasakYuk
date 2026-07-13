import { extractYoutubeId } from "@/utils/youtube";
import { YoutubeLogo } from "phosphor-react-native";
import { Linking, Platform, Text, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";

interface YoutubePlayerProps {
  url: string;
  height?: number;
}

export default function YoutubePlayer({
  url,
  height = 220,
}: YoutubePlayerProps) {
  const videoId = extractYoutubeId(url);

  if (!videoId) {
    return (
      <View
        style={{
          height,
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#e5e5e5",
          borderRadius: 16,
        }}
      >
        <Text style={{ color: "#7f8c8d" }}>Video tidak valid</Text>
      </View>
    );
  }

  const userAgent =
    Platform.OS === "android"
      ? "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36"
      : undefined;

  // Fungsi untuk membuka aplikasi YouTube asli
  const openInOriginalApp = async () => {
    const youtubeAppUrl = `vnd.youtube://${videoId}`;
    const youtubeWebUrl = `https://www.youtube.com/watch?v=${videoId}`;

    try {
      // Coba buka lewat aplikasi YouTube dulu
      const canOpen = await Linking.canOpenURL(youtubeAppUrl);
      if (canOpen) {
        await Linking.openURL(youtubeAppUrl);
      } else {
        // Kalau aplikasinya nggak ada, buka di browser bawaan HP
        await Linking.openURL(youtubeWebUrl);
      }
    } catch (error) {
      console.error("Gagal membuka YouTube:", error);
    }
  };

  return (
    <View style={{ width: "100%" }}>
      {/* Container Pemutar Video */}
      <View
        style={{ height, width: "100%", overflow: "hidden", borderRadius: 16 }}
      >
        <WebView
          source={{
            uri: `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&showinfo=0&controls=1`,
          }}
          style={{ flex: 1, backgroundColor: "#000" }}
          allowsFullscreenVideo={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          userAgent={userAgent}
          mediaPlaybackRequiresUserAction={false}
          onShouldStartLoadWithRequest={(request) => {
            return request.url.startsWith("http");
          }}
        />
      </View>

      {/* Tombol Rencana B (Muncul di Bawah Video) */}
      <TouchableOpacity
        onPress={openInOriginalApp}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F2F2F2",
          paddingVertical: 12,
          marginTop: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#E5E5E5",
        }}
      >
        <YoutubeLogo color="#FF0000" size={20} weight="fill" />
        <Text
          style={{
            marginLeft: 8,
            color: "#333",
            fontWeight: "600",
            fontSize: 14,
          }}
        >
          Tonton di Aplikasi YouTube Asli
        </Text>
      </TouchableOpacity>
    </View>
  );
}
