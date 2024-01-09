/** @type {import('tailwindcss').Config} */
const { createThemes } = require('tw-colors');


module.exports = {
  darkMode: 'class',
  mode: 'jit',
  purge: [
    './static/*.{js,jsx,ts,tsx,vue,css,scss,sass,less,styl}',
    './static/js/*.{js,jsx,ts,tsx,vue,css,scss,sass,less,styl}',
    './static/mail_templates/*.html',
    './templates/*.html',

  ],


  // darkMode: ['class'],
  theme: {
    extend: {},
    listStyleType: {
      none: 'none',
      disc: 'disc',
      decimal: 'decimal',
      square: 'square',
      roman: 'upper-roman',
    }
  },
  // plugins: [require('tailwindcss-dark-mode')(),
  // createThemes({
  //   "futuristic_theme": {
  //     "black": "#000000",
  //     "gray-900": "#1c1c1c",
  //     "gray-800": "#2b2b2b",
  //     "gray-700": "#3a3a3a",
  //     "gray-600": "#4a4a4a",
  //     "gray-500": "#5a5a5a",
  //     "gray-400": "#6b6b6b",
  //     "gray-300": "#7b7b7b",
  //     "gray-200": "#8c8c8c",
  //     "gray-100": "#9c9c9c",
  //     "white": "#ffffff",
  //     "red-500": "#FF0000",
  //     "red-600": "#DC2626",
  //     "green-500": "#00FF00",
  //     "green-600": "#059669",
  //     "blue-500": "#0000FF",
  //     "blue-600": "#2563EB",
  //     "yellow-400": "#FBBF24",
  //     "yellow-500": "#F59E0B",
  //     "yellow-600": "#D97706"
  //   },
  //   "light_theme": {
  //     "black": "#dcfce7",
  //     "gray-900": "#f1f5f9",
  //     "gray-800": "#e2e8f0",
  //     "gray-700": "#cbd5e1",
  //     "gray-600": "#f3f4f6",
  //     "gray-500": "#020617",
  //     "gray-400": "#020617",
  //     "gray-300": "#020617",
  //     "gray-200": "#020617",
  //     "gray-100": "#020617",
  //     "white": "#020617",

  //     "red-500": "#FF0000",
  //     "red-600": "#DC2626",
  //     "green-500": "#00FF00",
  //     "green-600": "#059669",
  //     "blue-500": "#0000FF",
  //     "blue-600": "#2563EB",
  //     "yellow-400": "#FBBF24",
  //     "yellow-500": "#F59E0B",
  //     "yellow-600": "#D97706"
  //   },
  //   "digital_theme": {
  //     'black': '#000000',
  //     'gray-900': '#1c1c1c',
  //     'gray-800': '#2b2b2b',
  //     'gray-700': '#3a3a3a',
  //     'gray-600': '#4a4a4a',
  //     'gray-500': '#5a5a5a',
  //     'gray-400': '#6b6b6b',
  //     'gray-300': '#7b7b7b',
  //     'gray-200': '#8c8c8c',
  //     'gray-100': '#9c9c9c',
  //     'white': '#ffffff',

  //     "red-500": "#FF0000",
  //     "red-600": "#DC2626",
  //     "green-500": "#00FF00",
  //     "green-600": "#059669",
  //     "blue-500": "#0000FF",
  //     "blue-600": "#2563EB",
  //     "yellow-400": "#FBBF24",
  //     "yellow-500": "#F59E0B",
  //     "yellow-600": "#D97706"
  //   },
  //   "dark_theme": {
  //     'black': '#000000',
  //     'gray-900': 'rgb(17 24 39)',
  //     'gray-800': 'rgb(31 41 55)',
  //     'gray-700': 'rgb(55 65 81)',
  //     'gray-600': 'rgb(75 85 99)',
  //     'gray-500': 'rgb(107 114 128)',
  //     'gray-400': 'rgb(156 163 175)',
  //     'gray-300': 'rgb(209 213 219)',
  //     'gray-200': 'rgb(229 231 235)',
  //     'gray-100': 'rgb(243 244 246)',
  //     'white': '#ffff',
  //     "red-500": "#EF4444",
  //     "red-600": "#DC2626",
  //     "green-500": "#10B981",
  //     "green-600": "#059669",
  //     "blue-500": "#3B82F6",
  //     "blue-600": "#2563EB",
  //     "yellow-400": "#FBBF24",
  //     "yellow-500": "#F59E0B",
  //     "yellow-600": "#D97706"
  //   },
  // })
  // ],
  variants: ['darker', 'dark-hover', 'dark-group-hover', 'dark-even', 'dark-odd'],

  // To enable dark mode for only single utility class:
  variants: {
    backgroundColor: ['darker', 'dark-hover', 'dark-group-hover', 'dark-even', 'dark-odd'],
    extend: {},
  }
}
