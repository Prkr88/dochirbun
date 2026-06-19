import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./services/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-app)", "Arial", "sans-serif"]
      },
      colors: {
        ink: "#161616",
        paper: "#fffdf8",
        mint: "#2f8f83",
        tomato: "#c84f3f",
        steel: "#40536b",
        sun: "#f3b33d"
      }
    }
  },
  plugins: []
};

export default config;
