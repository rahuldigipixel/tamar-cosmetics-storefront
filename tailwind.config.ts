import type { Config } from "tailwindcss";

/**
 * Tailwind v4 is CSS-first (see the `@theme` block in globals.css) — this file
 * only exists to extend the RTL-related logical-property utilities and the
 * Hebrew type ramp that don't have a natural home in `@theme`. It's wired in
 * via `@config` at the top of globals.css.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        heebo: ["var(--font-heebo)"],
        rubik: ["var(--font-rubik)"],
      },
      colors: {
        brand: {
          primary: "var(--brand-primary)",
          accent: "var(--brand-accent)",
          soft: "var(--brand-soft)",
        },
      },
    },
  },
};

export default config;
