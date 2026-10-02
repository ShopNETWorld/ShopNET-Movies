import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090a0f',
        foreground: '#f3f4f6',
        card: {
          DEFAULT: '#11131c',
          foreground: '#f3f4f6'
        },
        primary: {
          DEFAULT: '#6366f1',
          foreground: '#ffffff',
          hover: '#4f46e5'
        },
        accent: {
          DEFAULT: '#f43f5e',
          foreground: '#ffffff'
        },
        gold: {
          DEFAULT: '#f59e0b',
          foreground: '#000000'
        },
        muted: {
          DEFAULT: '#1f2438',
          foreground: '#9ca3af'
        },
        border: '#232942'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(to right bottom, #11131c, #090a0f)'
      }
    }
  },
  plugins: []
};

export default config;
