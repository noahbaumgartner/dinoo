import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
  safelist: [
    "bg-blue-100",
    "text-blue-500",
    "border-blue-300",
    "bg-red-100",
    "text-red-500",
    "border-red-300",
    "bg-yellow-100",
    "text-yellow-500",
    "border-yellow-300",
    "bg-green-100",
    "text-green-500",
    "border-green-300",
  ]
};
export default config;
