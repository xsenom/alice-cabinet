/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        rubik: ["Rubik", "ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Arial"],
      },
      boxShadow: {
        glass: "0 20px 60px rgba(0,0,0,.45)",
        soft: "0 12px 30px rgba(0,0,0,.25)",
      },
      backdropBlur: {
        glass: "18px",
      },
    },
  },
  plugins: [],
};
