/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F7F6F3',
        surface: '#FFFFFF',
        border: '#E5E4DF',
        ink: '#1C1C1A',
        muted: '#6D6D66',
        faint: '#ADADA5',
        accent: '#3A6BC5',
        'accent-soft': '#E8EEFB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
