const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// ◄ Arahkan input ke ./src/global.css sesuai struktur kamu
module.exports = withNativeWind(config, { input: "./src/global.css" });
