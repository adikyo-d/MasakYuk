import {
    createAudioPlayer,
    setAudioModeAsync,
    type AudioPlayer,
} from "expo-audio";

// Cache player per key, biar file audio ga di-load ulang tiap dipanggil
const players: Record<string, AudioPlayer> = {};

function getPlayer(key: string, source: number): AudioPlayer {
  if (!players[key]) {
    players[key] = createAudioPlayer(source);
  }
  return players[key];
}

/**
 * Panggil sekali di awal (root layout atau saat masuk screen yang butuh audio)
 * biar suara tetap kedengeran walau HP di mode silent — penting buat timer masak.
 */
export async function configureAudioMode() {
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
  } catch (error) {
    console.error("Gagal set audio mode:", error);
  }
}

/** Suara pendek saat timer di suatu langkah habis */
export function playTimerDone() {
  try {
    const player = getPlayer("timer", require("../../assets/sounds/alarm.mp3"));
    player.seekTo(0);
    player.play();
  } catch (error) {
    console.error("Gagal memutar suara timer:", error);
  }
}

/** Suara pendek saat user menekan "Selesai Masak" */
export function playSuccess() {
  try {
    const player = getPlayer(
      "success",
      require("../../assets/sounds/success.mp3"),
    );
    player.seekTo(0);
    player.play();
  } catch (error) {
    console.error("Gagal memutar suara sukses:", error);
  }
}

/** 🎵 Musik tema latar selama mode masak — loop terus sampai dihentikan */
export function playCookingTheme() {
  try {
    const player = getPlayer(
      "cookingTheme",
      require("../../assets/sounds/cooking-theme.mp3"),
    );
    player.loop = true;
    player.volume = 0.35; // lebih pelan dari sfx timer/sukses, biar gak nabrak
    player.play();
  } catch (error) {
    console.error("Gagal memutar musik tema masak:", error);
  }
}

export function stopCookingTheme() {
  players["cookingTheme"]?.pause();
}

/** 🎵 Musik tema latar untuk halaman rahasia ulang tahun */
export function playBirthdayTheme() {
  try {
    const player = getPlayer(
      "birthdayTheme",
      require("../../assets/sounds/birthday-theme.mp3"),
    );
    player.loop = true;
    player.volume = 0.5;
    player.play();
  } catch (error) {
    console.error("Gagal memutar musik ulang tahun:", error);
  }
}

export function stopBirthdayTheme() {
  players["birthdayTheme"]?.pause();
}

/** Bersihkan semua player — panggil saat keluar screen yang pakai audio */
export function cleanupAudio() {
  Object.values(players).forEach((p) => {
    try {
      p.remove();
    } catch {
      // sudah di-remove / gak masalah
    }
  });
  Object.keys(players).forEach((k) => delete players[k]);
}
