/**
 * Memutar suara ketika timer habis.
 */
export async function playTimerDone() {
  try {
    console.log("[Audio] Timer selesai!");
    // TODO: Tambahkan file alarm.mp3 ke assets/sounds/ lalu uncomment:
    // const player = useAudioPlayer(require("../../assets/sounds/alarm.mp3"));
    // player.play();
  } catch (error) {
    console.error("Gagal memutar suara timer:", error);
  }
}

/**
 * Memutar suara ketika pengguna menekan "Selesai Masak".
 */
export async function playSuccess() {
  try {
    console.log("[Audio] Memasak Selesai!");
    // TODO: Tambahkan file success.mp3 ke assets/sounds/ lalu uncomment:
    // const player = useAudioPlayer(require("../../assets/sounds/success.mp3"));
    // player.play();
  } catch (error) {
    console.error("Gagal memutar suara sukses:", error);
  }
}

/**
 * Membersihkan memori (placeholder — expo-audio handles cleanup automatically)
 */
export async function cleanupAudio() {
  // expo-audio manages lifecycle automatically
}
