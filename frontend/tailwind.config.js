/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        peso: {
          blue:  '#1a3c6e', // PESO dark blue
          light: '#2563eb', // Accent blue
          gold:  '#f59e0b', // QC gold accent
        }
      }
    },
  },
  plugins: [],
}
