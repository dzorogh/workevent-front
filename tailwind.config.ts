import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        secondary: {
          DEFAULT: "#494BE2",
          dark: "#2426B0",
        },
        primary: {
          DEFAULT: "#DEF967",
          dark: "#CAE553",
          darker: "#B6D13F"
        }
      }
    },
    container: {
      center: true,
      padding: '1rem',
    },
  },
  plugins: [],
} satisfies Config;
