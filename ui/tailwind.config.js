const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}", flowbite.content()],
  theme: {
    extend: {
      colors: {
        brand: "#EE90A8",
      },
    },
  },
  plugins: [flowbite.plugin()],
};
