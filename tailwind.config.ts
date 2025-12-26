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
        rarity: {
          common: "#4a5568",
          uncommon: "#22543d",
          rare: "#0ea5e9",
          epic: "#9333ea",
          legendary: "#fbbf24",
          mythical: "linear-gradient(to right, #fbbf24, #ffffff)",
        },
      },
    },
  },
  plugins: [],
};
export default config;

