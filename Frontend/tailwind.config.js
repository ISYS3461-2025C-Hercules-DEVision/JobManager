/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E11D48',
          hover: '#BE123C',
        },
        'dark': '#111111',
        'dark-black': '#000000',
        'light-gray': '#F3F4F6',
      },
    },
  },
  plugins: [],
}
