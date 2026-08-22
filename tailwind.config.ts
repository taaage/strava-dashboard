import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        background: "#09090b",
        surface: {
          DEFAULT: "#09090b",
          card: "#111113",
          border: "#27272a",
          muted: "#1c1c1f",
        },
        chart: {
          1: "#e76e50",
          2: "#2a9d8f",
          3: "#e9c46a",
          4: "#f4a261",
          5: "#264653",
        },
        text: {
          primary: "#fafafa",
          secondary: "#a1a1aa",
          muted: "#71717a",
        },
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
