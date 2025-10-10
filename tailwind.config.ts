import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#4338CA",
        secondary: "#7C3AED"
      }
    }
  },
  plugins: []
};

export default config;
