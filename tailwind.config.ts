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
        darkGreen: {
          DEFAULT: "#173612",
          50: "#F5FAF0",
          100: "#ECF5DE",
          200: "#CBE0A3",
          300: "#8FB44E",
          400: "#5F8722",
          500: "#43670F",
          600: "#2E6125",
          700: "#1F4719",
          800: "#173612",
          900: "#0F240B",
          950: "#091706",
        },
        florida: {
          yellow: "#FEEF30",
          yellowHover: "#F0DF01",
          green: "#43670F",
          darkGreen: "#173612",
          olive: "#75791B",
          red: "#B2101C",
          violet: "#7059A6",
          grey: "#F4F4F4",
          charcoal: "#173612",
        },
        banhmi: {
          bg: "#FFFFFF",
          card: "#FBFBF9",
          red: "#173612",
          redDark: "#0F240B",
          gold: "#FEEF30",
          dark: "#173612",
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
          50: "#F5FAF0",
          100: "#EAF3E4",
          200: "#D2E4C7",
          300: "#98BF86",
          400: "#5A8B46",
          500: "#366825",
          600: "#27501B",
          700: "#1F4316",
          800: "#173612",
          900: "#10260C",
          950: "#091706",
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
