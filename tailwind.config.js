/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: '#FF5500',
          'orange-light': '#FF7733',
          green: '#22c55e',
          amber: '#F59E0B',
          dark: '#0F0F0F',
          surface: '#1A1A1A',
          card: '#222222',
          border: '#2E2E2E',
          muted: '#888888',
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
