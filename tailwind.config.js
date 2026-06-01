/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#348385',
          'teal-light': '#addfe3',
          'teal-dark': '#295c60',
          green: '#22c55e',
          amber: '#F59E0B',
          dark: '#0C1B1E',
          surface: '#143639',
          card: '#1b4448',
          border: '#1f4f54',
          muted: '#6b8e92',
        },
      },
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        sans: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
