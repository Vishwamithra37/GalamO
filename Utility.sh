# How to download and initialize tailwindcss using npm.
# npm install -d tailwindcss    #This will download tailwindcss
# npx tailwindcss init          #This will initialize tailwindcss and create tailwind.config.js file in your project directory.

# Configuring the tailwind.config.js file to be in jit mode and purge the unused css. Observing directories static and templates.

# module.exports = {
#   mode: 'jit',
#   purge: [
#     './static/**/*.html',
#     './templates/**/*.html',
#   ],
#   darkMode: false, // or 'media' or 'class'
#   theme: {
#     extend: {},
#   },
#   variants: {
#     extend: {},
#   },
#   plugins: [],
# }

npx tailwindcss -i ./static/input.css -o ./static/styles.css --watch

