import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#12785a',
          dark: '#0b5c44',
          light: '#2f9578',
          muted: '#d4ede5'
        },
        amber: {
          brand: '#f4a63c',
          light: '#fdf3e3'
        }
      },
      fontFamily: {
        sans: ['Manrope', 'Segoe UI Variable', 'Segoe UI', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif']
      },
      borderRadius: {
        panel: '18px'
      },
      backdropBlur: {
        panel: '8px'
      }
    }
  },
  plugins: []
} satisfies Config;
