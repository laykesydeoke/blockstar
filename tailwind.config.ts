import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // BlockStar Brand Colors (Blue-Purple)
        lab: {
          blue: "#6366F1",
          "blue-dark": "#4F46E5",
          purple: "#A78BFA",
          black: "#070B1A",
          "black-light": "#0F1629",
          "black-lighter": "#1A2040",
          white: "#FEFFFF",
          grey: "#A0A0A0",
          "grey-dark": "#6B7280",
        },
        // Primary/Secondary (Blue-Purple)
        primary: "#6366F1",
        secondary: "#8B5CF6",
        // Feedback Colors (Strategic use)
        success: "#10B981",
        error: "#EF4444",
        info: "#3B82F6",
        // Answer Colors (Keep for answer buttons)
        "answer-a": "#EF4444",
        "answer-b": "#3B82F6",
        "answer-c": "#EAB308",
        "answer-d": "#22C55E",
        // Dark theme backgrounds
        surface: "#0F1629",
        background: "#070B1A",
      },
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
        display: ["League Spartan", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      keyframes: {
        countdown: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
        reveal: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        celebrate: {
          "0%, 100%": { transform: "scale(1) rotate(0deg)" },
          "25%": { transform: "scale(1.1) rotate(-5deg)" },
          "75%": { transform: "scale(1.1) rotate(5deg)" },
        },
      },
      animation: {
        countdown: "countdown 1s ease-in-out infinite",
        reveal: "reveal 0.5s ease-out",
        celebrate: "celebrate 0.6s ease-in-out",
      },
    },
  },
  plugins: [],
};
export default config;
