/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'custom': '0 0 8px rgba(0, 0, 0, 0.2)',
      },
      screens: {
        xs: { min: '320px', max: '480px' },
        sm: { min: '480px', max: '768px' },
        md: { min: '768px', max: '1024px' },
      },
    },
  },
  plugins: [
    // ...
    require("tailwind-scrollbar"),
  ],
}