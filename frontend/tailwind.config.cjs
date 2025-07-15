// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }


// tailwind.config.js
module.exports = {
  content: [
    "./index.html", // Or your main HTML file
    "./src/**/*.{js,jsx,ts,tsx}", // This line is crucial for React components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};