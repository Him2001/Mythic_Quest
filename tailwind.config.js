/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        cinzel: ['Cinzel', 'serif'],
        merriweather: ['Merriweather', 'serif'],
      },
      colors: {
        parchment: {
          light: '#f5e6d3',
          DEFAULT: '#e6d5b8',
          dark: '#d4c4a7',
        },
        mystic: {
          light: '#8B4513',
          DEFAULT: '#654321',
          dark: '#4a3214',
        },
      },
      boxShadow: {
        'inner-lg': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'magical': '0 0 15px rgba(255, 215, 0, 0.3)',
      },
      backgroundImage: {
        'fantasy': "url('/background.jpg')",
      },
    },
  },
  plugins: [],
};