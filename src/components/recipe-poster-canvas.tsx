import {
    Canvas,
    Group,
    ImageFormat,
    Path,
    Rect,
    Skia,
    Image as SkiaImage,
    useCanvasRef,
    useImage,
} from "@shopify/react-native-skia";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import {
    ArrowCounterClockwise,
    Check,
    Eraser,
    ImageSquare,
    NotePencil,
    PaintBrush,
    PencilSimple,
    Trash,
} from "phosphor-react-native";
import { useRef, useState } from "react";
import { Dimensions, Image, Pressable, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

type Mode = "choice" | "drawing" | "preview";
type CanvasMode = "blank" | "photo";

type Stroke = {
  path: any;
  color: string;
  strokeWidth: number;
  isEraser: boolean;
};

const CANVAS_HEIGHT = 260;
const CANVAS_WIDTH = Dimensions.get("window").width - 32;

const BRUSH_PALETTE = [
  { name: "Terracotta", color: "#E07A5F" },
  { name: "Sage", color: "#81B29A" },
  { name: "Yellow", color: "#F9E79F" },
  { name: "Charcoal", color: "#2F3E46" },
  { name: "White", color: "#FFFFFF" },
];

const BACKGROUND_OPTIONS = [
  { name: "Cream", color: "#FDFBF7" },
  { name: "White", color: "#FFFFFF" },
  { name: "Sage Muda", color: "#E8F0EC" },
];

type Props = {
  onPosterSaved: (uri: string) => void;
  initialUri?: string | null;
};

export default function RecipePosterCanvas({
  onPosterSaved,
  initialUri,
}: Props) {
  const [mode, setMode] = useState<Mode>(initialUri ? "preview" : "choice");
  const [canvasMode, setCanvasMode] = useState<CanvasMode>("blank");
  const [photoUri, setPhotoUri] = useState<string | null>(initialUri || null);
  const [previewUri, setPreviewUri] = useState<string | null>(
    initialUri || null,
  );
  const [backgroundColor, setBackgroundColor] = useState(
    BACKGROUND_OPTIONS[0].color,
  );
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentColor, setCurrentColor] = useState(BRUSH_PALETTE[0].color);
  const [brushSize, setBrushSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);

  const currentPath = useRef(Skia.Path.Make());
  const [, forceRerender] = useState(0);
  const canvasRef = useCanvasRef();

  const skiaImage = useImage(
    canvasMode === "photo" ? (photoUri ?? undefined) : undefined,
  );

  // === Pilih: Mulai dari Kanvas Kosong ===
  const startBlankCanvas = () => {
    setCanvasMode("blank");
    setPhotoUri(null);
    setMode("drawing");
  };

  // === Pilih: Upload Foto ===
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCanvasMode("photo");
      setPhotoUri(result.assets[0].uri);
      setMode("drawing");
    }
  };

  // === Gesture Menggambar ===
  const pan = Gesture.Pan()
    .runOnJS(true)
    .onStart((e) => {
      currentPath.current = Skia.Path.Make();
      currentPath.current.moveTo(e.x, e.y);
      forceRerender((n) => n + 1);
    })
    .onUpdate((e) => {
      currentPath.current.lineTo(e.x, e.y);
      forceRerender((n) => n + 1);
    })
    .onEnd(() => {
      const savedPath = currentPath.current.copy();
      setStrokes((prev) => [
        ...prev,
        {
          path: savedPath,
          color: currentColor,
          strokeWidth: brushSize,
          isEraser,
        },
      ]);
      currentPath.current = Skia.Path.Make();
      forceRerender((n) => n + 1);
    });

  // === Aksi Kanvas ===
  const handleUndo = () => setStrokes((prev) => prev.slice(0, -1));
  const handleClear = () => setStrokes([]);

  const handleDone = async () => {
    try {
      const snapshot = canvasRef.current?.makeImageSnapshot();
      if (!snapshot) return;

      const base64 = snapshot.encodeToBase64(ImageFormat.PNG, 100);
      const fileUri = `${FileSystem.documentDirectory}poster-${Date.now()}.png`;

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setPreviewUri(fileUri);
      onPosterSaved(fileUri);
      setMode("preview");
    } catch (error) {
      console.error("Gagal menyimpan poster:", error);
    }
  };

  const handleRedraw = () => setMode("drawing");

  const handleReset = () => {
    setMode("choice");
    setPhotoUri(null);
    setPreviewUri(null);
    setStrokes([]);
    currentPath.current = Skia.Path.Make();
    forceRerender((n) => n + 1);
    onPosterSaved("");
  };

  // === MODE: CHOICE (Pilih Kanvas Kosong / Upload) ===
  if (mode === "choice") {
    return (
      <View className="mb-4 rounded-2xl bg-sketchCard p-4">
        <Text className="text-sketchCharcoal font-bold mb-3">Poster Resep</Text>
        <View className="flex-row gap-3">
          <Pressable
            onPress={startBlankCanvas}
            className="flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-sketchSage py-6"
          >
            <NotePencil color="#81B29A" size={32} weight="duotone" />
            <Text className="text-sketchSage font-semibold text-sm mt-2 text-center">
              Gambar dari{"\n"}Kanvas Kosong
            </Text>
          </Pressable>

          <Pressable
            onPress={pickImage}
            className="flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-sketchTerracotta py-6"
          >
            <ImageSquare color="#E07A5F" size={32} weight="duotone" />
            <Text className="text-sketchTerracotta font-semibold text-sm mt-2 text-center">
              Upload Foto{"\n"}Masakan
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // === MODE: PREVIEW ===
  if (mode === "preview" && previewUri) {
    return (
      <View
        className="mb-4 rounded-2xl overflow-hidden"
        style={{ height: CANVAS_HEIGHT }}
      >
        <Image
          source={{ uri: previewUri }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute top-3 right-3 flex-row gap-2">
          <Pressable
            onPress={handleReset}
            className="flex-row items-center gap-1 bg-white/90 rounded-full px-3 py-1.5 shadow-sm"
          >
            <Trash color="#E07A5F" size={14} weight="bold" />
            <Text className="text-sketchTerracotta text-xs font-semibold">
              Ganti
            </Text>
          </Pressable>
          <Pressable
            onPress={handleRedraw}
            className="flex-row items-center gap-1 bg-white/90 rounded-full px-3 py-1.5 shadow-sm"
          >
            <PencilSimple color="#2F3E46" size={14} weight="bold" />
            <Text className="text-sketchCharcoal text-xs font-semibold">
              Edit Coretan
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // === MODE: DRAWING ===
  return (
    <View className="mb-4 rounded-2xl overflow-hidden">
      {/* Top Action Bar */}
      <View className="flex-row items-center justify-between bg-sketchCharcoal px-4 py-2.5">
        <View className="flex-row items-center gap-4">
          <Pressable
            onPress={handleReset}
            className="px-2 py-1 bg-red-500/20 rounded-md"
          >
            <Text className="text-red-400 font-bold text-xs">Batal</Text>
          </Pressable>
          <Pressable onPress={handleUndo} className="p-1">
            <ArrowCounterClockwise color="#FDFBF7" size={20} weight="bold" />
          </Pressable>
          <Pressable onPress={handleClear} className="p-1">
            <Trash color="#FDFBF7" size={20} weight="bold" />
          </Pressable>
        </View>
        <Pressable onPress={handleDone} className="p-1">
          <Check color="#81B29A" size={22} weight="bold" />
        </Pressable>
      </View>

      {/* Canvas Area */}
      <GestureDetector gesture={pan}>
        <View style={{ height: CANVAS_HEIGHT, width: CANVAS_WIDTH }}>
          <Canvas ref={canvasRef} style={{ flex: 1 }}>
            {/* Background: solid color kalau blank, foto kalau photo */}
            {canvasMode === "blank" ? (
              <Rect
                x={0}
                y={0}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                color={backgroundColor}
              />
            ) : (
              skiaImage && (
                <SkiaImage
                  image={skiaImage}
                  x={0}
                  y={0}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  fit="cover"
                />
              )
            )}

            <Group layer>
              {strokes.map((stroke, i) => (
                <Path
                  key={i}
                  path={stroke.path}
                  color={stroke.color}
                  style="stroke"
                  strokeWidth={stroke.strokeWidth}
                  strokeCap="round"
                  strokeJoin="round"
                  blendMode={stroke.isEraser ? "clear" : "srcOver"}
                />
              ))}
              <Path
                path={currentPath.current}
                color={currentColor}
                style="stroke"
                strokeWidth={brushSize}
                strokeCap="round"
                strokeJoin="round"
                blendMode={isEraser ? "clear" : "srcOver"}
              />
            </Group>
          </Canvas>
        </View>
      </GestureDetector>

      {/* Background Color Picker — hanya muncul untuk kanvas kosong */}
      {canvasMode === "blank" && (
        <View className="flex-row items-center gap-2 bg-sketchCard px-4 py-2 border-b border-gray-100">
          <Text className="text-sketchMuted text-xs mr-1">Latar:</Text>
          {BACKGROUND_OPTIONS.map((bg) => (
            <Pressable
              key={bg.color}
              onPress={() => setBackgroundColor(bg.color)}
              className="w-6 h-6 rounded-full"
              style={{
                backgroundColor: bg.color,
                borderWidth: backgroundColor === bg.color ? 2 : 1,
                borderColor:
                  backgroundColor === bg.color ? "#E07A5F" : "#E5E7EB",
              }}
            />
          ))}
        </View>
      )}

      {/* Bottom Toolbar */}
      <View className="flex-row items-center justify-between bg-sketchCard px-4 py-3">
        <Pressable
          onPress={() => setIsEraser(true)}
          className={`p-2 rounded-full ${isEraser ? "bg-sketchBg" : ""}`}
        >
          <Eraser
            color="#2F3E46"
            size={20}
            weight={isEraser ? "fill" : "regular"}
          />
        </Pressable>

        <Pressable
          onPress={() => setIsEraser(false)}
          className={`p-2 rounded-full ${!isEraser ? "bg-sketchBg" : ""}`}
        >
          <PaintBrush
            color="#2F3E46"
            size={20}
            weight={!isEraser ? "fill" : "regular"}
          />
        </Pressable>

        <View className="flex-row gap-2">
          {BRUSH_PALETTE.map((p) => (
            <Pressable
              key={p.color}
              onPress={() => {
                setCurrentColor(p.color);
                setIsEraser(false);
              }}
              className="w-7 h-7 rounded-full items-center justify-center"
              style={{
                backgroundColor: p.color,
                borderWidth: currentColor === p.color && !isEraser ? 2 : 1,
                borderColor:
                  currentColor === p.color && !isEraser ? "#2F3E46" : "#E5E7EB",
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
