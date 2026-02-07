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
        background: "var(--background)",
        foreground: "var(--foreground)",
        'david-beige': '#F8F7F2',
        'david-green': '#1A3B32',
      },
      fontFamily: {
        sans: ['var(--font-heebo)'],
        serif: ['var(--font-frank-ruhl)'],
        bellefair: ['var(--font-bellefair)'],
      },
    },
  },
  plugins: [],
};
export default config;
