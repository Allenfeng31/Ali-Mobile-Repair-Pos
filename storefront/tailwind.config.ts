import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // For App Router if not in src
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./(pos)/**/*.{js,ts,jsx,tsx,mdx}", // Specifically scanning route groups
    "./(public)/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      colors: {
        slate: {
          50: '#f8fafc',
          900: '#0f172a',
        },
        indigo: {
          600: '#4f46e5',
        }
      }
    },
  },
  plugins: [],
};

export default config;
