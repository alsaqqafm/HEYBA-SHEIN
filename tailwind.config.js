/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1d4ed8', // Royal Electric Blue
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#172554',
          950: '#0f172a',
        },
        jeeb: {
          DEFAULT: '#10b981',
          light: '#ecfdf5',
          dark: '#047857',
        },
        kuraimi: {
          DEFAULT: '#f59e0b',
          light: '#fffbeb',
          dark: '#b45309',
        }
      },
      fontFamily: {
        sans: ['Tajawal', 'Cairo', 'Alexandria', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'brand': '0 10px 25px -5px rgba(29, 78, 216, 0.3)',
      }
    },
  },
  plugins: [],
}
