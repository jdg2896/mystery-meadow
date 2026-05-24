import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kitty: {
          50: "#fff5fa",
          100: "#ffe6f2",
          200: "#ffc6e1",
          300: "#ffa3cf",
          400: "#ff7ab8",
          500: "#ff5aa3",
          600: "#ec3a8a",
          700: "#c92872",
          800: "#9a1f59",
          900: "#6b1640",
        },
        cream: "#fff9f1",
        sky: {
          soft: "#cfeeff",
        },
      },
      fontFamily: {
        cute: ['"Fredoka"', '"Mochiy Pop One"', "system-ui", "sans-serif"],
        body: ['"Quicksand"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        kawaii: "0 6px 0 rgba(236, 58, 138, 0.25)",
        kawaiiSoft: "0 4px 16px rgba(236, 58, 138, 0.18)",
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        sparkle: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "50%": { transform: "scale(1.2)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        wiggle: "wiggle 600ms ease-in-out",
        sparkle: "sparkle 350ms ease-out",
        floaty: "floaty 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
