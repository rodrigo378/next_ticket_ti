// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "bg-[url('/assets/fondo_login.jfif')]", // o cambia el archivo a .jpg y actualiza aquí
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-ui)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  plugins: [],
};
export default config;
