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
        florida: {
          yellow: "#FEEF30",
          yellowHover: "#F0DF01",
          green: "#43670F",
          olive: "#75791B",
          red: "#B2101C",
          violet: "#7059A6",
          grey: "#F4F4F4",
          charcoal: "#252525",
        },
        banhmi: {
          bg: "#FFFFFF",
          card: "#FBFBF9",
          red: "#43670F",
          redDark: "#2B4407",
          gold: "#FEEF30",
          dark: "#252525",
        },
        cream: {
          50: "#FCFAF6",
          100: "#F7F3EC",
          200: "#EFE6D8",
          300: "#E5D5BF",
          400: "#D8BFA1",
          500: "#D49226",
        },
        espresso: {
          50: "#F5F2F0",
          100: "#E6DFDC",
          200: "#CCBFB9",
          300: "#B39F96",
          400: "#997F73",
          500: "#806050",
          600: "#664A3D",
          700: "#4D362A",
          800: "#33221A",
          900: "#1F140F",
          950: "#120D0A",
        },
      },
      boxShadow: {
        "warm-sm": "0 2px 8px -2px rgba(67, 103, 15, 0.08)",
        "warm-md": "0 6px 20px -4px rgba(67, 103, 15, 0.12)",
        "warm-xl": "0 16px 36px -6px rgba(67, 103, 15, 0.18)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "Asap", "sans-serif"],
        sans: ["var(--font-sans)", "Inter", "Poppins", "sans-serif"],
        serif: ["Merriweather", "Georgia", "serif"],
        bebas: ["'Bebas Neue'", "Impact", "sans-serif"],
        mono: ["var(--font-mono)", "Space Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
