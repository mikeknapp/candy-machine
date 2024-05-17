const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}", flowbite.content()],
  theme: {
    extend: {
      colors: {
        accent: "#ee90a8",
        primary: {
          50: "#fdf3f4",
          100: "#fce7eb",
          200: "#f9d2db",
          300: "#f3aebe",
          400: "#ee90a8",
          500: "#e0537b",
          600: "#cb3365",
          700: "#ab2555",
          800: "#8f224c",
          900: "#7b2046",
          950: "#440d22",
        },
      },
    },
  },
  plugins: [
    flowbite.plugin(),
    function ({ addUtilities }) {
      const newUtilities = {
        ".scrollbar-thin::-webkit-scrollbar": {
          width: "6px",
        },
        ".scrollbar-thin::-webkit-scrollbar-thumb": {
          backgroundColor: "#888",
          borderRadius: "10px",
        },
        ".scrollbar-thin::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#555",
        },
        ".scrollbar-thin": {
          scrollbarWidth: "thin",
          scrollbarColor: "#888 #f0f0f0",
        },
      };
      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
};
