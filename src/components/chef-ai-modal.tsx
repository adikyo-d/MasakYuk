import {
    ChatTeardropText,
    Fire,
    PaperPlaneRight,
    Plant,
    Sparkle,
    X,
} from "phosphor-react-native";
import { useRef, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type ChefAIModalProps = {
  visible: boolean;
  onClose: () => void;
  recipeName: string;
};

type Message = {
  id: string;
  text: string;
  sender: "user" | "ai";
};

export default function ChefAIModal({
  visible,
  onClose,
  recipeName,
}: ChefAIModalProps) {
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const suggestedQuestions = [
    "Apakah resep ini cocok untuk diet?",
    "Bisa diganti ayam dengan tahu?",
    "Berapa kalorinya?",
    "Bisa untuk anak?",
    "Bagaimana membuatnya lebih pedas?",
    "Apa manfaat makanan ini?",
  ];

  // Fungsi untuk mengirim pesan
  const handleSend = (textToSend: string) => {
    if (textToSend.trim().length === 0) return;

    // 1. Tambahkan pesan pengguna ke layar
    const newUserMsg: Message = {
      id: Date.now().toString(),
      text: textToSend.trim(),
      sender: "user",
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setInputText("");
    setIsTyping(true);

    // 2. Simulasi balasan dari AI (Nanti ini diganti dengan pemanggilan API Gemini)
    setTimeout(() => {
      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: `Ini adalah balasan simulasi dari Chef AI untuk pertanyaan: "${textToSend.trim()}". Nanti kita akan hubungkan langsung ke backend Gemini!`,
        sender: "ai",
      };
      setMessages((prev) => [...prev, newAiMsg]);
      setIsTyping(false);
    }, 1500); // Jeda 1.5 detik agar terasa seperti sedang berpikir
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="max-h-[90%] min-h-[75%] rounded-t-3xl bg-sketchBg"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-gray-200 p-5">
            <View className="flex-row items-center gap-2">
              <Sparkle color="#E07A5F" size={24} weight="fill" />
              <View>
                <Text className="text-xl font-bold text-sketchCharcoal">
                  Chef AI
                </Text>
                {isTyping && (
                  <Text className="text-xs font-semibold text-sketchTerracotta">
                    sedang mengetik...
                  </Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="rounded-full bg-gray-100 p-2"
            >
              <X color="#2F3E46" size={16} weight="bold" />
            </TouchableOpacity>
          </View>

          {/* Area Chat */}
          <ScrollView
            ref={scrollViewRef}
            className="p-5"
            showsVerticalScrollIndicator={false}
            // Auto-scroll ke bawah setiap ada pesan baru
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            {/* ---------------- BAGIAN KONTEKS AWAL ---------------- */}
            {/* Pesan Sambutan */}
            <View className="mb-6 self-start rounded-2xl rounded-tl-none bg-sketchCard p-4 shadow-sm">
              <Text className="text-base font-semibold text-sketchCharcoal">
                Halo 👋
              </Text>
              <Text className="mt-1 text-sm text-sketchMuted">
                Aku Chef AI. Aku sudah mempelajari resep{" "}
                <Text className="font-bold text-sketchTerracotta">
                  {recipeName}
                </Text>{" "}
                ini dan siap membantu!
              </Text>
            </View>

            {/* Analisis Nutrisi */}
            <View className="mb-6 rounded-2xl border border-sketchTerracotta/30 bg-sketchTerracotta/5 p-4">
              <View className="mb-3 flex-row items-center gap-2">
                <Fire color="#E07A5F" size={18} weight="bold" />
                <Text className="font-bold text-sketchCharcoal">
                  Analisis Nutrisi (Estimasi)
                </Text>
              </View>

              <View className="flex-row flex-wrap gap-2">
                <View className="rounded-xl bg-white px-3 py-2 shadow-sm">
                  <Text className="text-xs text-sketchMuted">Kalori</Text>
                  <Text className="font-bold text-sketchCharcoal">
                    420 kcal
                  </Text>
                </View>
                <View className="rounded-xl bg-white px-3 py-2 shadow-sm">
                  <Text className="text-xs text-sketchMuted">Protein</Text>
                  <Text className="font-bold text-sketchCharcoal">34 g</Text>
                </View>
                <View className="rounded-xl bg-white px-3 py-2 shadow-sm">
                  <Text className="text-xs text-sketchMuted">Karbo</Text>
                  <Text className="font-bold text-sketchCharcoal">18 g</Text>
                </View>
                <View className="rounded-xl bg-white px-3 py-2 shadow-sm">
                  <Text className="text-xs text-sketchMuted">Lemak</Text>
                  <Text className="font-bold text-sketchCharcoal">15 g</Text>
                </View>
              </View>

              <View className="mt-3 flex-row items-start gap-2 rounded-xl bg-white p-3">
                <Plant color="#81B29A" size={18} weight="fill" />
                <Text className="flex-1 text-xs text-sketchMuted">
                  <Text className="font-semibold text-sketchCharcoal">
                    Insight:{" "}
                  </Text>
                  Protein tinggi. Cocok setelah olahraga. Jika ingin lebih
                  sehat, kurangi minyak dan kecap manis.
                </Text>
              </View>
            </View>

            {/* Saran Pertanyaan (Sembunyikan jika sudah mulai chat) */}
            {messages.length === 0 && (
              <View>
                <View className="mb-4 flex-row items-center gap-2">
                  <ChatTeardropText color="#7F8C8D" size={18} weight="fill" />
                  <Text className="font-bold text-sketchCharcoal">
                    Tanya Apa Saja
                  </Text>
                </View>
                <View className="mb-6 flex-row flex-wrap gap-2">
                  {suggestedQuestions.map((q, idx) => (
                    <TouchableOpacity
                      key={idx}
                      className="rounded-full border border-gray-200 bg-white px-4 py-2"
                      onPress={() => handleSend(q)}
                    >
                      <Text className="text-sm text-sketchCharcoal">{q}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* ---------------- BAGIAN GELEMBUNG CHAT ---------------- */}
            {messages.map((msg) => (
              <View
                key={msg.id}
                className={`mb-4 max-w-[85%] p-4 shadow-sm ${
                  msg.sender === "user"
                    ? "self-end rounded-2xl rounded-tr-none bg-sketchTerracotta"
                    : "self-start rounded-2xl rounded-tl-none border border-gray-100 bg-white"
                }`}
              >
                <Text
                  className={`text-base leading-6 ${
                    msg.sender === "user" ? "text-white" : "text-sketchCharcoal"
                  }`}
                >
                  {msg.text}
                </Text>
              </View>
            ))}

            {/* Indikator Mengetik AI */}
            {isTyping && (
              <View className="mb-4 max-w-[85%] self-start rounded-2xl rounded-tl-none border border-gray-100 bg-white p-4 shadow-sm">
                <ActivityIndicator color="#E07A5F" size="small" />
              </View>
            )}

            {/* Jarak kosong di bawah agar tidak tertutup keyboard */}
            <View className="h-6" />
          </ScrollView>

          {/* Input Chat Bawah */}
          <View className="border-t border-gray-200 bg-white p-4">
            <View className="flex-row items-center rounded-full bg-gray-100 px-4 py-2">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Tanya soal resep ini..."
                placeholderTextColor="#7F8C8D"
                className="max-h-24 flex-1 text-base text-sketchCharcoal"
                multiline
              />
              <TouchableOpacity
                onPress={() => handleSend(inputText)}
                disabled={inputText.trim().length === 0 || isTyping}
                className={`ml-2 rounded-full p-2 ${
                  inputText.trim().length > 0 && !isTyping
                    ? "bg-sketchTerracotta"
                    : "bg-gray-300"
                }`}
              >
                <PaperPlaneRight color="#FFFFFF" size={16} weight="fill" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
