/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "../../packages/merchant-core/src/**/*.{js,jsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0f172a',
          blue: '#2563eb',
          'blue-hover': '#1d4ed8',
          'blue-subtle': '#eff6ff',
          emerald: '#10b981',
          amber: '#f59e0b',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
