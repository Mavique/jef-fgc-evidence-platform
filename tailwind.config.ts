import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        chalk: "rgb(var(--color-chalk) / <alpha-value>)",
        clay: "rgb(var(--color-clay) / <alpha-value>)",
        ochre: "rgb(var(--color-ochre) / <alpha-value>)",
        canopy: "rgb(var(--color-canopy) / <alpha-value>)",
        signal: "rgb(var(--color-signal) / <alpha-value>)",
        graphite: "rgb(var(--color-graphite) / <alpha-value>)",
        cyan: "rgb(var(--color-cyan) / <alpha-value>)",
        lime: "rgb(var(--color-lime) / <alpha-value>)",
        amber: "rgb(var(--color-amber) / <alpha-value>)"
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"]
      },
      boxShadow: {
        fine: "0 24px 80px rgb(16 24 24 / 0.12)"
      },
      transitionTimingFunction: {
        fluid: "cubic-bezier(0.16, 1, 0.3, 1)"
      }
    }
  },
  plugins: []
};

export default config;
