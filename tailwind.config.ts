import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'pizza-red': '#DC2626',      // Rojo llamativo
        'pizza-yellow': '#F59E0B',   // Amarillo que combina con rojo
        'pizza-cream': '#FEF3C7',    // Color crema para pizzería
        'pizza-dark': '#991B1B',     // Rojo oscuro para acentos
        'pizza-light': '#FEE2E2',    // Rojo claro para fondos
      },
    },
  },
  plugins: [],
};

export default config; 