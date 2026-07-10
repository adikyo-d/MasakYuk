import { Audio } from "expo-av";

// Simpan referensi ke sound object agar bisa di-unload dari memory
let timerSound: Audio.Sound | null = null;
let successSound: Audio.Sound | null = null;

/**
 * Memutar suara ketika timer habis.
 */
export async function playTimerDone() {
  try {
    console.log("🔊 [Audio] Timer selesai!");
    
    /* 
    TODO: UNCOMMENT KODE DI BAWAH INI SETELAH FILE AUDIO DITAMBAHKAN
    Pastikan Anda sudah menyimpan file mp3 di folder: src/assets/sounds/alarm.mp3
    
    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/sounds/alarm.mp3")
    );
    timerSound = sound;
    await sound.playAsync();
    */
  } catch (error) {
    console.error("Gagal memutar suara timer:", error);
  }
}

/**
 * Memutar suara ketika pengguna menekan "Selesai Masak".
 */
export async function playSuccess() {
  try {
    console.log("🔊 [Audio] Memasak Selesai!");
    
    /*
    TODO: UNCOMMENT KODE DI BAWAH INI SETELAH FILE AUDIO DITAMBAHKAN
    Pastikan Anda sudah menyimpan file mp3 di folder: src/assets/sounds/success.mp3

    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/sounds/success.mp3")
    );
    successSound = sound;
    await sound.playAsync();
    */
  } catch (error) {
    console.error("Gagal memutar suara sukses:", error);
  }
}

/**
 * Membersihkan memori (dipanggil saat screen di-unmount)
 */
export async function cleanupAudio() {
  if (timerSound) {
    await timerSound.unloadAsync();
    timerSound = null;
  }
  if (successSound) {
    await successSound.unloadAsync();
    successSound = null;
  }
}
