# 🍳 MasakYuk

**MasakYuk** (sebelumnya dikembangkan dengan nama kode _SketchChef_) adalah aplikasi mobile untuk mendokumentasikan, mengelola, dan menelusuri koleksi resep pribadi. Aplikasi ini mengusung konsep estetika **Warm Minimalist Kitchen** — ruang visual yang bersih, navigasi intuitif, dan kehangatan nuansa dapur modern lewat palet warna bernada bumi (earthy tones).

---

## 📋 Daftar Isi

- [Deskripsi Umum](#-deskripsi-umum)
- [Tech Stack](#-tech-stack)
- [Palet Warna (Design Tokens)](#-palet-warna-design-tokens)
- [Struktur Project](#-struktur-project)
- [File Konfigurasi Utama](#-file-konfigurasi-utama)
- [Routing & Halaman](#-routing--halaman-expo-router)
- [Rincian Fitur per Halaman](#-rincian-fitur-per-halaman)
- [Styling dengan NativeWind](#-styling-dengan-nativewind)
- [Komponen React Native vs Web](#-komponen-react-native-vs-web)
- [Instalasi & Menjalankan Project](#-instalasi--menjalankan-project)
- [Aturan Install Package](#-aturan-install-package)
- [Roadmap Pengembangan](#-roadmap-pengembangan)
- [Aturan & Konvensi Penting](#-aturan--konvensi-penting)

---

## 🎯 Deskripsi Umum

MasakYuk dikembangkan menggunakan ekosistem modern berskala industri untuk memastikan performa tinggi, kemudahan maintenance kode, serta siklus pengembangan cepat melalui **Hot Reload** langsung ke perangkat fisik Android. Pengembangan telah beralih sepenuhnya dari simulasi Expo Go ke arsitektur produksi berbasis **Development Build** lokal.

---

## 🛠 Tech Stack

| Komponen Teknologi                | Deskripsi & Peran dalam Sistem                                                                                                                                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React Native & Expo SDK 57**    | Framework inti pengembangan lintas platform. SDK 57 menyediakan runtime modern yang stabil, integrasi arsitektur native terbaru, dan optimasi performa memory.                                                            |
| **Expo Router (Flat Routing)**    | Sistem routing berbasis file. Menggunakan pendekatan _Flat Structure_ langsung di dalam folder `src/app/`, di mana logika menu navigasi bawah (Tabs) diabstraksikan ke komponen kustom eksternal agar kode tetap modular. |
| **TypeScript (.tsx / .ts)**       | Bahasa pemrograman utama dengan _strong-typing_, meminimalkan error runtime, dan mempermudah auto-complete di editor.                                                                                                     |
| **NativeWind v4 (Tailwind CSS)**  | Mesin utility-first styling yang mengompilasi class CSS menjadi gaya native. Menggunakan file sentral `src/global.css` untuk token desain global.                                                                         |
| **ADB via USB & expo-dev-client** | Debugging tingkat lanjut dengan custom APK debug langsung ke perangkat Android fisik via Android Debug Bridge, tanpa ketergantungan pada Expo Go.                                                                         |

---

## 🎨 Palet Warna (Design Tokens)

Semua warna didaftarkan sebagai custom color di `tailwind.config.js`, sehingga bisa langsung dipakai lewat `className` (misalnya `bg-sketchBg`, `text-sketchTerracotta`).

| Variabel           | Preview          | Hex Code  | Fungsi Utama dalam UI                                                                                                                                          |
| ------------------ | ---------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sketchBg`         | 🟨 (krem)        | `#FDFBF7` | **Background Utama** — warna krem hangat yang ramah mata, menghindari kesan kaku dari putih polos standar. Dipakai sebagai latar belakang dasar seluruh layar. |
| `sketchCard`       | ⬜ (putih)       | `#FFFFFF` | **Background Komponen** — putih bersih kontras tinggi untuk membungkus kartu resep, kolom pencarian, dan pop-up formulir.                                      |
| `sketchTerracotta` | 🟧 (oranye bata) | `#E07A5F` | **Aksen Utama** — dipakai untuk tombol aksi utama (CTA), indikator tab aktif, dan elemen yang perlu menarik perhatian pengguna.                                |
| `sketchSage`       | 🟩 (hijau sage)  | `#81B29A` | **Aksen Sekunder** — hijau segar untuk indikator durasi memasak, badge "hidup sehat", atau tanda centang selesai.                                              |
| `sketchCharcoal`   | ⬛ (abu gelap)   | `#2F3E46` | **Teks Utama** — abu-abu arang sangat gelap untuk judul dan tulisan tebal, kontras namun tidak sekaku hitam pekat.                                             |
| `sketchMuted`      | ◻️ (abu netral)  | `#7F8C8D` | **Teks Sekunder** — abu-abu netral untuk placeholder input, sub-judul informasi, dan teks keterangan waktu yang tidak dominan.                                 |

### Contoh penerapan di kode

```tsx
<View className="flex-1 bg-sketchBg px-4 pt-14">
  <View className="bg-sketchCard rounded-2xl p-4">
    <Text className="text-2xl font-bold text-sketchCharcoal">
      Resep Favoritku
    </Text>
    <Text className="text-sm text-sketchMuted">12 resep tersimpan</Text>
    <Pressable className="bg-sketchTerracotta rounded-xl px-4 py-2 mt-3">
      <Text className="text-white font-semibold">Tambah Resep</Text>
    </Pressable>
    <Text className="text-sketchSage text-xs mt-2">✓ Sudah dicoba</Text>
  </View>
</View>
```

### Konfigurasi warna di `tailwind.config.js`

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        sketchBg: "#FDFBF7",
        sketchCard: "#FFFFFF",
        sketchTerracotta: "#E07A5F",
        sketchSage: "#81B29A",
        sketchCharcoal: "#2F3E46",
        sketchMuted: "#7F8C8D",
      },
    },
  },
};
```

---

## 📁 Struktur Project

```
MasakYuk/
├── app.json                 ← Konfigurasi utama Expo
├── package.json             ← Daftar dependency & scripts
├── tsconfig.json            ← Konfigurasi TypeScript
├── babel.config.js          ← Konfigurasi Babel (transpiler)
├── metro.config.js          ← Konfigurasi Metro (bundler)
├── tailwind.config.js       ← Konfigurasi Tailwind/NativeWind
├── assets/                  ← Gambar, ikon, font
│   └── images/
└── src/
    ├── global.css           ← CSS inti untuk injeksi utilitas NativeWind v4
    ├── app/                 ← ROUTING — setiap file = 1 halaman (flat structure)
    │   ├── _layout.tsx      ← Root layout & konfigurasi Tabs
    │   ├── index.tsx        ← Beranda (route: "/")
    │   ├── explore.tsx      ← Jelajah resep (route: "/explore")
    │   ├── favorit.tsx      ← Resep favorit (route: "/favorit")
    │   ├── tambah.tsx       ← Tambah resep baru (route: "/tambah")
    │   ├── profil.tsx       ← Profil chef (route: "/profil")
    │   └── [id].tsx         ← Detail resep dinamis (route: "/123", "/abc", dst)
    ├── components/          ← Komponen UI reusable (RecipeCard, AppTabs, dll)
    ├── constants/            ← Konstanta tema semantik (warna, spacing)
    └── hooks/                ← Custom React hooks untuk manajemen state
```

---

## ⚙️ File Konfigurasi Utama

### `app.json` — Identitas Aplikasi

```json
{
  "expo": {
    "name": "MasakYuk",
    "slug": "MasakYuk",
    "scheme": "masakyuk",
    "plugins": ["expo-router"],
    "experiments": {
      "typedRoutes": true,
      "reactCompiler": true
    }
  }
}
```

- `name` — nama tampil di HP.
- `slug` — ID unik project di server Expo.
- `scheme` — deep linking (`masakyuk://...`).
- `plugins` — mengaktifkan file-based routing lewat Expo Router.
- `typedRoutes` — autocomplete route yang type-safe di TypeScript.
- `reactCompiler` — optimasi render otomatis dari React Compiler.

### `package.json` — Dependency & Scripts

```json
{
  "main": "expo-router/entry",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web"
  }
}
```

> ⚠️ **Penting:** `"main": "expo-router/entry"` wajib ada agar Metro tahu project ini memakai file-based routing.

### `tsconfig.json` — Path Alias

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/assets/*": ["./assets/*"]
    }
  }
}
```

Import jadi ringkas: `@/components/app-tabs` alih-alih `../../components/app-tabs`.

### `babel.config.js` — Transpiler

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo", "nativewind/babel"],
  };
};
```

- `babel-preset-expo` — preset standar wajib semua project Expo.
- `nativewind/babel` — agar `className` Tailwind bisa berjalan di React Native.

### `metro.config.js` — Bundler

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./src/global.css" });
```

Metro adalah bundler khusus React Native (pengganti Webpack). File ini menghubungkan NativeWind ke `global.css`.

---

## 🧭 Routing & Halaman (Expo Router)

Aturan utama: **setiap file `.tsx` di `src/app/` otomatis menjadi 1 halaman/route.**

| File                  | Route URL           | Keterangan                       |
| --------------------- | ------------------- | -------------------------------- |
| `src/app/index.tsx`   | `/`                 | Halaman utama (Beranda)          |
| `src/app/explore.tsx` | `/explore`          | Halaman jelajah resep            |
| `src/app/favorit.tsx` | `/favorit`          | Halaman resep favorit            |
| `src/app/tambah.tsx`  | `/tambah`           | Halaman tambah resep             |
| `src/app/profil.tsx`  | `/profil`           | Halaman profil                   |
| `src/app/[id].tsx`    | `/123`, `/abc`, dst | Route dinamis — detail resep     |
| `src/app/_layout.tsx` | —                   | Bukan halaman, layout pembungkus |

### Aturan Penamaan File

- **`index.tsx`** → halaman default folder (mirip `index.html`).
- **`namafile.tsx`** → otomatis jadi route `/namafile`.
- **`[param].tsx`** → route dinamis, ambil parameter lewat `useLocalSearchParams()`.
- **`_layout.tsx`** → layout/wrapper, **bukan** halaman.
- **Prefix `_`** → file apapun yang diawali underscore **tidak** dianggap route.

### Navigasi Antar Halaman

```tsx
import { Link, router } from "expo-router";

// Cara 1: Komponen Link
<Link href="/explore">Ke Explore</Link>;

// Cara 2: Programatik
router.push("/explore"); // push ke stack (bisa back)
router.replace("/explore"); // ganti halaman (tidak bisa back)
router.back(); // kembali ke sebelumnya
```

### Mengakses Parameter Dinamis

```tsx
import { useLocalSearchParams } from "expo-router";

export default function DetailResep() {
  const { id } = useLocalSearchParams(); // contoh: id = "12"
  return <Text>Resep ID: {id}</Text>;
}
```

### Layout (`_layout.tsx`)

```tsx
// src/app/_layout.tsx
export default function TabLayout() {
  return (
    <ThemeProvider value={...}>
      <AnimatedSplashOverlay />   {/* Splash screen animasi */}
      <AppTabs />                 {/* Tab bar navigasi */}
    </ThemeProvider>
  );
}
```

Tab bar didefinisikan di komponen terpisah:

```tsx
// src/components/app-tabs.tsx
<NativeTabs>
  <NativeTabs.Trigger name="index">
    <NativeTabs.Trigger.Label>Beranda</NativeTabs.Trigger.Label>
  </NativeTabs.Trigger>
  <NativeTabs.Trigger name="explore">
    <NativeTabs.Trigger.Label>Jelajah</NativeTabs.Trigger.Label>
  </NativeTabs.Trigger>
</NativeTabs>
```

> `name` pada `NativeTabs.Trigger` harus **sama persis** dengan nama file (tanpa `.tsx`).

---

## 🍽 Rincian Fitur per Halaman

### `src/app/index.tsx` — Beranda / Koleksi Resep

Sapaan dinamis personal untuk koki, bar pencarian dengan sudut lengkung (`rounded-2xl`), menu scroll horizontal kategori resep (Semua, Makanan, Pastry, Minuman), serta grid 2 kolom yang menampilkan kartu-kartu resep rahasia pengguna.

### `src/app/explore.tsx` — Jelajah Resep

Tempat menelusuri resep-resep publik baru di luar koleksi pribadi untuk mendapatkan inspirasi memasak harian.

### `src/app/tambah.tsx` — Tambah Resep Baru

Formulir entri interaktif dengan area drop-zone foto masakan bergaris putus-putus (`dashed border`), input judul, input durasi, serta baris-baris input dinamis untuk menambahkan daftar bahan baku dan urutan langkah memasak secara real-time.

### `src/app/favorit.tsx` — Resep Pilihan

Menampilkan resep yang telah ditandai bintang/bookmark oleh pengguna agar dapat diakses instan.

### `src/app/profil.tsx` — Profil Chef

Memuat bio singkat koki, pengaturan preferensi aplikasi, serta statistik ringkas seperti jumlah resep yang sudah ditulis dan disimpan.

### `src/app/[id].tsx` — Detail Resep (Dinamis)

Rute dinamis fullscreen yang menyembunyikan navigasi bawah, menampilkan foto hero makanan berukuran besar, disusul lembar informasi putih interaktif dengan tab switcher antara **daftar bahan** (dengan checklist) dan **langkah memasak** yang terurut rapi.

---

## 🎨 Styling dengan NativeWind

NativeWind memungkinkan class Tailwind dipakai langsung di React Native.

```tsx
// ✅ BENAR
<View className="flex-1 bg-sketchBg px-4 pt-14">
<Text className="text-2xl font-bold text-sketchCharcoal">

// ❌ SALAH — beberapa class Tailwind TIDAK tersedia di React Native:
// - grid, grid-cols   (tidak ada CSS Grid)
// - hover:, focus:     (tidak ada hover di mobile)
// - gap                (terbatas, gunakan space-x/space-y atau margin)
```

### 3 File yang wajib ada untuk NativeWind

1. `tailwind.config.js` — konfigurasi warna & content paths.
2. `babel.config.js` — preset `nativewind/babel`.
3. `metro.config.js` — `withNativeWind(config, { input: "./src/global.css" })`.
4. `src/global.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 🔄 Komponen React Native vs Web

| Web (HTML)              | React Native                         | Import dari                   |
| ----------------------- | ------------------------------------ | ----------------------------- |
| `<div>`                 | `<View>`                             | `react-native`                |
| `<p>`, `<span>`, `<h1>` | `<Text>`                             | `react-native`                |
| `<img>`                 | `<Image>`                            | `react-native` / `expo-image` |
| `<input>`               | `<TextInput>`                        | `react-native`                |
| `<button>`              | `<TouchableOpacity>` / `<Pressable>` | `react-native`                |
| `<ul>` / `<li>`         | `<FlatList>`                         | `react-native`                |
| `<a>`                   | `<Link>`                             | `expo-router`                 |
| scroll container        | `<ScrollView>`                       | `react-native`                |

---

## ▶️ Instalasi & Menjalankan Project

```bash
# 1. Install dependency
npm install

# 2. Jalankan dev server
npx expo start
```

Setelah dev server aktif, tekan:

- `a` → buka di Android emulator/device
- `i` → buka di iOS simulator
- `w` → buka di browser

Atau langsung target platform tertentu:

```bash
npx expo start --android   # langsung ke Android
npx expo start --web       # langsung ke Web
```

---

## 📦 Aturan Install Package

### Package Expo / React Native (native module)

```bash
npx expo install nama-package
```

Selalu pakai `npx expo install`, **bukan** `npm install`, agar Expo otomatis memilih versi yang kompatibel dengan SDK 57.

Contoh:

```bash
npx expo install expo-camera          # Kamera
npx expo install expo-location        # GPS
npx expo install @react-native-async-storage/async-storage  # Local storage
```

### Package murni JavaScript (non-native)

```bash
npm install date-fns    # Library tanggal
npm install zod         # Validasi schema
```

---

## 🗺 Roadmap Pengembangan

| Fase                                 | Status          | Cakupan Pekerjaan                                                                                                                                                               |
| ------------------------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Environment Setup**             | ✅ Selesai      | Inisialisasi Expo SDK 57, instalasi NativeWind v4, perbaikan crash Metro Bundler di Windows, konfigurasi folder `src/`, aktivasi ADB global via USB ke perangkat Android fisik. |
| **2. Navigasi & Slicing Beranda**    | 🔶 Dalam Proses | Konfigurasi `src/app/_layout.tsx`, integrasi komponen navigasi tab kustom, kerangka `index.tsx`, penataan layout grid kartu resep.                                              |
| **3. Slicing Form Dinamis & Detail** | ⬜ Belum Mulai  | Layout formulir tambah resep dengan state input dinamis di `tambah.tsx`, serta tab switcher pada rute dinamis `[id].tsx`.                                                       |
| **4. State & Local Storage**         | ⬜ Belum Mulai  | Integrasi penyimpanan data lokal (SQLite/AsyncStorage) agar data resep tidak hilang saat aplikasi ditutup.                                                                      |
| **5. Build & Finalisasi APK**        | ⬜ Belum Mulai  | Optimasi performa render gambar, pembersihan log debugging, build standalone APK/AAB produksi.                                                                                  |

---

## ✅ Aturan & Konvensi Penting

1. Setiap file di `src/app/` = 1 route/halaman (kecuali diawali `_`).
2. `_layout.tsx` = layout/wrapper, **bukan** halaman.
3. Selalu pakai `npx expo install` untuk package Expo/React Native.
4. Gunakan `className` untuk styling (NativeWind), bukan `style` object — kecuali untuk hal yang tidak bisa dicover Tailwind.
5. Import komponen dari `react-native`, bukan tag HTML.
6. Path alias `@/` = folder `src/`. Gunakan `@/components/...`, `@/constants/...`.
7. File yang sudah dibuat (`favorit.tsx`, `tambah.tsx`, dll) tidak boleh dibiarkan kosong — minimal harus ada `export default function`.

---

<p align="center">Dibuat dengan 🧡 untuk para koki rumahan — <strong>MasakYuk</strong></p>
