/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{ts,tsx}",
    "./utils/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "term-green": "#33ff00",
        "term-green-dim": "#1a8000",
        "term-bg": "#050505",
        "term-panel": "#0a0a0a",
      },
      fontFamily: {
        mono: ['"VT323"', "monospace"],
      },
      animation: {
        blink: "blink 1s step-end infinite",
        "crt-flicker": "crtFlicker 0.15s infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        crtFlicker: {
          "0%": { opacity: "0.97" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
