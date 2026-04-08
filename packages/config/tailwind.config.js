/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          slate: '#334155',
          stone: '#78716c',
          zinc: '#18181b',
          amber: '#f59e0b',
        },
      },
    },
  },
  plugins: [],
};
