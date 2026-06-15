/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // brand orange ramp used across the app
        brand: {
          50: "#FFF7ED",
          100: "#FFFBF7",
          500: "#EA580C",
          700: "#9A3412",
        },
      },
    },
  },
  plugins: [],
};
