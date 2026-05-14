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
        rose: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
          700: "#be123c",
          800: "#9f1239",
          900: "#881337",
        },
        blush: {
          50: "#fdf8f8",
          100: "#fceef0",
          200: "#fad5db",
          300: "#f5aab6",
          400: "#ed7a8d",
          500: "#e14d66",
          600: "#cc2e4e",
          700: "#aa2240",
          800: "#8e1f39",
          900: "#791d34",
        },
        gold: {
          100: "#fef9ec",
          200: "#fdeec8",
          300: "#fad989",
          400: "#f7c34a",
          500: "#f4ab1e",
          600: "#d98a12",
          700: "#b56810",
          800: "#924f14",
          900: "#784215",
        },
        cream: {
          50: "#fefdfb",
          100: "#fdf8f2",
          200: "#faeee0",
          300: "#f5dfc8",
          400: "#edc9a6",
          500: "#e2ae82",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #fdf2f4 0%, #fff7f0 50%, #fdf8ff 100%)",
        "card-gradient":
          "linear-gradient(135deg, #fff0f3 0%, #fff7f0 100%)",
        "rose-gradient":
          "linear-gradient(135deg, #e11d48 0%, #f43f5e 50%, #fb7185 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      boxShadow: {
        "rose-sm": "0 2px 8px rgba(225, 29, 72, 0.15)",
        "rose-md": "0 4px 16px rgba(225, 29, 72, 0.2)",
        "rose-lg": "0 8px 32px rgba(225, 29, 72, 0.25)",
        soft: "0 4px 20px rgba(0, 0, 0, 0.08)",
        card: "0 2px 12px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
