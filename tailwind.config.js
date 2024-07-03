/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [`./views/*.ejs`], // all .ejs files //a4
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    themes: ['fantasy'],
  },
}

