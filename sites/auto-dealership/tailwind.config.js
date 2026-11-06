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
          dark: '#080c14',
          surface: '#0f172a',
          elevated: '#1e293b',
          card: 'rgba(15, 23, 42, 0.75)',
          border: 'rgba(255, 255, 255, 0.08)',
          blue: '#3b82f6',
          'blue-hover': '#2563eb',
          emerald: '#10b981',
          whatsapp: '#22c55e',
          'whatsapp-hover': '#16a34a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif']
      },
      boxShadow: {
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.4)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.4)',
        'glow-whatsapp': '0 0 25px -5px rgba(34, 197, 94, 0.4)',
      }
    },
  },
  plugins: [],
}
