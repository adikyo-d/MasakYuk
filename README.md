# 🍳 MasakYuk

**MasakYuk** (sebelumnya dikembangkan dengan nama kode _SketchChef_) adalah aplikasi mobile untuk mendokumentasikan, mengelola, dan menelusuri koleksi resep pribadi. Aplikasi ini mengusung konsep estetika **Warm Minimalist Kitchen** — ruang visual yang bersih, navigasi intuitif, dan kehangatan nuansa dapur modern lewat palet warna bernada bumi (earthy tones).

---

## 📋 Daftar Isi

- [Deskripsi Umum](#-deskripsi-umum)
- [Tech Stack & Library](#-tech-stack--library)
- [Struktur Project](#-struktur-project)
- [Palet Warna (Design Tokens)](#-palet-warna-design-tokens)
- [Routing & Halaman](#-routing--halaman-expo-router)
- [Rincian Fitur Utama](#-rincian-fitur-utama)
- [Konfigurasi Pengembangan](#-konfigurasi-pengembangan)
- [Instalasi & Menjalankan Project](#-instalasi--menjalankan-project)
- [Roadmap Pengembangan](#-roadmap-pengembangan)
- [Aturan & Konvensi Penting](#-aturan--konvensi-penting)

---

## 🎯 Deskripsi Umum

MasakYuk dikembangkan menggunakan ekosistem modern berskala industri untuk memastikan performa tinggi dan pengalaman pengguna yang halus. Fokus utama aplikasi ini adalah kemudahan mencatat resep secara lokal dengan dukungan multimedia (foto & audio) serta tampilan yang memanjakan mata.

---

## 🛠 Tech Stack & Library

### Core Engine
| Komponen | Versi / Deskripsi |
| :--- | :--- |
| **Expo SDK 57** | Platform utama dengan runtime modern dan stabil. |
| **React 19 & RN 0.86** | Library inti UI dengan arsitektur terbaru. |
| **TypeScript** | Pengetikan statis untuk meminimalkan error dan mempermudah maintenance. |
| **Expo Router** | Sistem routing berbasis file (File-based routing) yang intuitif. |

### UI & Styling
| Library | Kegunaan |
| :--- | :--- |
| **NativeWind v4** | Styling menggunakan utility classes Tailwind CSS. |
| **Lucide/Phosphor** | Ikon grafis yang konsisten dan minimalis. |
| **Skia (Shopify)** | Grafis 2D tingkat lanjut untuk elemen visual kustom. |
| **Reanimated & Gesture Handler** | Animasi halus (60fps) dan interaksi sentuhan yang responsif. |
| **Blur & Glass Effect** | Memberikan efek visual modern (glassmorphism) pada UI. |

### Data & Multimedia
| Library | Kegunaan |
| :--- | :--- |
| **Expo SQLite** | Database lokal untuk menyimpan teks resep secara permanen. |
| **Expo FileSystem** | Manajemen file fisik (simpan foto resep & aset lokal). |
| **Expo Image (Picker)** | Optimasi tampilan gambar dan akses ke galeri/kamera. |
| **Expo Audio** | Dukungan untuk fitur instruksi atau catatan suara. |

---

## 📁 Struktur Project

```
MasakYuk/
├── assets/                  ← Gambar, ikon, font, dan splash screen
├── src/
│   ├── app/                 ← [ROUTING] Setiap file = 1 Halaman
│   │   ├── _layout.tsx      ← Root layout, provider, & navigasi tab
│   │   ├── index.tsx        ← Beranda (Koleksi Resep)
│   │   ├── explore.tsx      ← Cari resep baru
│   │   ├── favorit.tsx      ← Resep tersimpan
│   │   ├── tambah.tsx       ← Form input resep dinamis
│   │   ├── profil.tsx       ← Pengaturan & Bio
│   │   └── [id].tsx         ← Detail resep (Dynamic route)
│   ├── components/          ← Komponen UI reusable (Card, Button, Input)
│   ├── constants/           ← Token desain (Warna, Spacing, Shadow)
│   ├── hooks/               ← Logika state & akses database (Custom hooks)
│   ├── services/            ← Abstraksi API atau FileSystem logic
│   └── global.css           ← Entry point Tailwind/NativeWind
├── tailwind.config.js       ← Konfigurasi tema warna kustom
├── app.json                 ← Konfigurasi identitas Expo app
└── package.json             ← Daftar dependency & script perintah
```

---

## 🎨 Palet Warna (Design Tokens)

Didefinisikan di `tailwind.config.js` untuk konsistensi di seluruh layar.

| Variabel | Hex | Peran UI |
| :--- | :--- | :--- |
| `sketchBg` | `#FDFBF7` | Background utama (Warm Cream) |
| `sketchCard` | `#FFFFFF` | Background kartu & modal (Pure White) |
| `sketchTerracotta`| `#E07A5F` | Aksen utama & Tombol aksi (CTA) |
| `sketchSage` | `#81B29A` | Indikator sukses/sehat (Soft Green) |
| `sketchCharcoal` | `#2F3E46` | Teks utama & Judul (Deep Grey) |
| `sketchMuted` | `#7F8C8D` | Teks keterangan & Placeholder |

---

## 🧭 Routing & Halaman

Aplikasi ini menggunakan **Flat Routing** di dalam `src/app/`.

1.  **Beranda (`/`)**: Menampilkan ringkasan koleksi resep pribadi.
2.  **Explore (`/explore`)**: Mencari inspirasi resep baru.
3.  **Tambah (`/tambah`)**: Form interaktif dengan input bahan & langkah dinamis.
4.  **Favorit (`/favorit`)**: Akses cepat ke resep bertanda bintang.
5.  **Detail (`/[id]`)**: Tampilan penuh resep dengan checklist bahan.

---

## ⚙️ Konfigurasi Pengembangan

- **Path Alias**: Menggunakan `@/` untuk merujuk ke folder `src/`. Contoh: `import { Card } from '@/components/Card'`.
- **Development Build**: Menggunakan `expo-dev-client` untuk running langsung di perangkat fisik via ADB (bukan Expo Go standar).
- **React Compiler**: Diaktifkan di `app.json` untuk optimasi render otomatis.

---

## ▶️ Instalasi & Menjalankan Project

```bash
# 1. Clone & Install
npm install

# 2. Jalankan Metro Bundler
npx expo start

# 3. Jalankan di Android (Physical/Emulator)
npx expo run:android
```

---

## 🗺 Roadmap Pengembangan

- [x] **Fase 1**: Environment Setup & Tech Stack Integration.
- [ ] **Fase 2**: Slicing UI Beranda & Navigasi Tab (Sedang Berjalan).
- [ ] **Fase 3**: Implementasi SQLite untuk penyimpanan resep.
- [ ] **Fase 4**: Fitur Multimedia (Upload foto ke FileSystem).
- [ ] **Fase 5**: Finalisasi UI & Build APK Produksi.

---

<p align="center">Dibuat dengan 🧡 untuk para koki rumahan — <strong>MasakYuk</strong></p>
