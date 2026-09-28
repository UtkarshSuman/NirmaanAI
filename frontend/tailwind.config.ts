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
          navy: "#173f5f",
          navyDark: "#0f2942",
          blue: "#1d6fa5",
          blueLight: "#f0f7fb",
          saffron: "#e97824",
          saffronLight: "#fef6ee",
          saffronDark: "#c65f16",
          red: "#c63f32",
          redLight: "#fdf2f1",
          teal: "#178b7a",
          tealLight: "#f0faf8",
          slate: "#334155",
          muted: "#64748b",
          border: "#e2e8f0",
          borderSubtle: "#f1f5f9",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        serif: ["Newsreader", "Charter", "Georgia", "Cambria", "Times", "serif"],
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      maxWidth: {
        observatory: "1440px",
      },
    },
  },
  plugins: [],
};

export default config;
