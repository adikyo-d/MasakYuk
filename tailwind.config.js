/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
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
  plugins: [],
};
