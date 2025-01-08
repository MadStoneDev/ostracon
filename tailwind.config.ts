import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    screens: {
      xs: "480px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-outfit)", ...fontFamily.sans],
        serif: ["var(--font-merriweather)", ...fontFamily.serif],
        accent: ["var(--font-lilita-one)", ...fontFamily.sans],
      },
      colors: {
        light: "#FCFAF9",
        dark: "#32383E",

        primary: "#F49B90",
        secondary: "#FDE4DF",

        nsfw: "#934FA5",
      },
    },
  },
  plugins: [],
};
export default config;
