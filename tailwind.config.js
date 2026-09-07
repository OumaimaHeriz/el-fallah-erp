/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        oasis: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#15803d',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        palm: {
          DEFAULT: '#1b4d3e',
          dark: '#113329',
          light: '#2d6a4f',
          accent: '#52b788',
        },
        deglet: {
          amber: '#d4a373',
          gold: '#e9c46a',
          sand: '#faedcd',
          dark: '#bc6c25',
        },
        sahara: {
          bg: '#fbf9f5',
          card: '#ffffff',
          darkbg: '#0f172a',
          darkcard: '#1e293b',
        }
      },
      fontFamily: {
        arabic: ['Tajawal', 'Cairo', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
