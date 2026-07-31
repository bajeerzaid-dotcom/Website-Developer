import type { Config } from "tailwindcss";

// Design tokens ported 1:1 from the approved UI/UX Blueprint (§1.1 Color Palette, §1.2 Typography, §1.3 Spacing & Grid)
const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#C1121F", // Red — CTAs, links, active states, brand accents
          dark: "#8C0D17",    // hover/pressed
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#FFFFFF", // White — surfaces, cards
        },
        accent: {
          DEFAULT: "#1F2A44", // Black/Navy — headings, header/footer bg
          foreground: "#FFFFFF",
        },
        surface: {
          soft: "#F7F7F5",   // page background
          tint: "#FBEAEA",   // light red tint (hero/section bg, badges)
        },
        muted: {
          DEFAULT: "#5F5E5A", // body copy / secondary text
        },
        border: "#E5E5E2",
        success: "#2E7D32",
        warning: "#B7791F",
        danger: "#B3261E",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-poppins)", "var(--font-inter)", "system-ui", "sans-serif"],
      },
      fontSize: {
        h1: ["2rem", { lineHeight: "2.5rem", fontWeight: "700" }],   // 32/40
        h2: ["1.625rem", { lineHeight: "2.125rem", fontWeight: "600" }], // 26/34
        h3: ["1.25rem", { lineHeight: "1.75rem", fontWeight: "600" }],   // 20/28
        h4: ["1.0625rem", { lineHeight: "1.5rem", fontWeight: "600" }],  // 17/24
        body: ["0.9375rem", { lineHeight: "1.5rem", fontWeight: "400" }], // 15/24
        small: ["0.8125rem", { lineHeight: "1.25rem", fontWeight: "400" }], // 13/20
        caption: ["0.75rem", { lineHeight: "1rem", fontWeight: "400" }], // 12/16
      },
      borderRadius: {
        DEFAULT: "8px",
        card: "12px",
      },
      spacing: {
        // 4px base unit — 8/12/16/24/32/48/64 already covered by Tailwind defaults (2/3/4/6/8/12/16)
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.2s ease-out",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
