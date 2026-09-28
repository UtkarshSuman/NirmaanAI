import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        gov: {
          bg: "#f8fafc",
          surface: "#ffffff",
          navy: "#0f172a",
          slate: "#1e293b",
          muted: "#64748b",
          border: "#e2e8f0",
          saffron: "#ea580c",
          saffronLight: "#fff7ed",
          saffronDark: "#c2410c",
          green: "#16a34a",
          greenLight: "#f0fdf4",
          red: "#dc2626",
          redLight: "#fef2f2",
          blue: "#0284c7",
          blueLight: "#f0f9ff",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        serif: ["Newsreader", "Charter", "Georgia", "Cambria", "Times", "serif"],
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
