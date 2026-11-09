/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "../../packages/merchant-core/src/**/*.{js,jsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0f172a',
          blue: '#2563eb',
          'blue-hover': '#1d4ed8',
          'blue-subtle': '#eff6ff',
          'blue-border': '#bfdbfe',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          dark: '#080c14',
          surface: '#0f172a',
          elevated: '#1e293b',
          card: 'rgba(15, 23, 42, 0.75)',
          border: 'rgba(255, 255, 255, 0.08)',
          whatsapp: '#22c55e',
          'whatsapp-hover': '#16a34a'
        }
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible Next"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['"Atkinson Hyperlegible Next"', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgb(0 0 0 / 0.05), 0 2px 6px -1px rgb(0 0 0 / 0.03)',
        'card-hover': '0 14px 34px -4px rgb(37 99 235 / 0.12), 0 4px 12px -2px rgb(0 0 0 / 0.04)',
        'glow-blue': '0 0 25px -5px rgba(37, 99, 235, 0.4)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        'glow-whatsapp': '0 0 25px -5px rgba(34, 197, 94, 0.4)',
      }
    },
  },
  plugins: [],
}
