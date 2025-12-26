import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        crossover: {
          primary: "#ff006e",
          secondary: "#8338ec",
          accent: "#3a86ff",
          gold: "#ffbe0b",
          orange: "#fb5607",
          dark: "#0a0e27",
          darker: "#050811",
        },
        rarity: {
          common: "#6b7280",
          uncommon: "#10b981",
          rare: "#3b82f6",
          epic: "#a855f7",
          legendary: "#fbbf24",
          mythical: "#fbbf24",
        },
      },
      backgroundImage: {
        "crossover-gradient": "linear-gradient(135deg, #ff006e 0%, #8338ec 50%, #3a86ff 100%)",
        "crossover-dark": "linear-gradient(135deg, #050811 0%, #0a0e27 50%, #1a1f3a 100%)",
        "crossover-gold": "linear-gradient(135deg, #ffbe0b 0%, #fb5607 100%)",
      },
      boxShadow: {
        "crossover-glow": "0 0 20px rgba(255, 0, 110, 0.5), 0 0 40px rgba(131, 56, 236, 0.3)",
        "crossover-glow-gold": "0 0 20px rgba(255, 190, 11, 0.6), 0 0 40px rgba(251, 86, 7, 0.4)",
        "crossover-glow-blue": "0 0 20px rgba(58, 134, 255, 0.5), 0 0 40px rgba(0, 102, 255, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;

