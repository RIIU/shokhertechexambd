/**
 * ShokherTech Exam BD — Design tokens
 * -----------------------------------------------------------------------------
 * Dark-first palette inspired by pixxen.com: obsidian surfaces, electric
 * emerald brand, indigo glow secondary and cyan highlights.
 *
 * Fonts are wired as CSS variables in app/layout.tsx (next/font) and
 * app/globals.css (@font-face for Ador Noirrit), so this file only maps them
 * to families.
 */
const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", md: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1320px" },
    },
    extend: {
      colors: {
        // Electric Emerald — primary brand
        brand: {
          50: "#E6FFF6",
          100: "#B8FFE6",
          200: "#7DFFD2",
          300: "#3DF5B5",
          400: "#00E699", // signature
          500: "#00CC88",
          600: "#00A36D",
          700: "#007A52",
          800: "#005238",
          900: "#00291C",
          DEFAULT: "#00E699",
        },
        // Indigo Glow — secondary accent
        glow: {
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          DEFAULT: "#6366F1",
        },
        // Light cyan highlights
        cyanlight: {
          300: "#67E8F9",
          400: "#22D3EE",
          DEFAULT: "#67E8F9",
        },
        // Backgrounds & surfaces
        obsidian: {
          950: "#070A12",
          900: "#0B0F19", // app background
          800: "#111827", // raised background
          DEFAULT: "#0B0F19",
        },
        surface: {
          DEFAULT: "#1F2937",
          soft: "#161E2C",
          hover: "#243041",
          border: "#1F2937",
        },
        ink: {
          DEFAULT: "#FFFFFF",
          muted: "#9CA3AF",
          subtle: "#6B7280",
        },
        // Semantic exam states
        state: {
          answered: "#00E699",
          flagged: "#F59E0B",
          unanswered: "#374151",
          danger: "#F43F5E",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-bangla-fallback)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "var(--font-inter)", "system-ui", "sans-serif"],
        // Every Bangla string uses this family. 'Ador Noirrit' is self-hosted
        // and limited to the Bengali unicode-range (see globals.css), so Latin
        // letters inside Bangla sentences fall through to Inter. Hind Siliguri
        // covers Bangla glyphs while Ador Noirrit loads or if it is missing.
        bangla: ["'Ador Noirrit'", "var(--font-inter)", "var(--font-bangla-fallback)", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "radial-brand":
          "radial-gradient(60% 60% at 50% 0%, rgba(0,230,153,0.18) 0%, rgba(11,15,25,0) 70%)",
        "radial-glow":
          "radial-gradient(50% 50% at 50% 50%, rgba(99,102,241,0.25) 0%, rgba(11,15,25,0) 70%)",
        "brand-gradient": "linear-gradient(135deg, #00E699 0%, #67E8F9 50%, #6366F1 100%)",
        "text-gradient": "linear-gradient(90deg, #FFFFFF 0%, #B8FFE6 40%, #00E699 70%, #67E8F9 100%)",
      },
      backgroundSize: {
        grid: "48px 48px",
      },
      boxShadow: {
        "glow-sm": "0 0 0 1px rgba(0,230,153,0.15), 0 0 12px -2px rgba(0,230,153,0.35)",
        glow: "0 0 0 1px rgba(0,230,153,0.25), 0 0 32px -6px rgba(0,230,153,0.45)",
        "glow-lg": "0 0 0 1px rgba(0,230,153,0.3), 0 0 60px -10px rgba(0,230,153,0.55)",
        "glow-indigo": "0 0 0 1px rgba(99,102,241,0.3), 0 0 40px -8px rgba(99,102,241,0.5)",
        "glow-danger": "0 0 0 1px rgba(244,63,94,0.4), 0 0 32px -4px rgba(244,63,94,0.6)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 40px -24px rgba(0,0,0,0.8)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        // Rotates the conic gradient behind .border-animated (uses @property --border-angle)
        "border-spin": {
          to: { "--border-angle": "360deg" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "80%, 100%": { transform: "scale(2.2)", opacity: "0" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 1px rgba(0,230,153,0.25), 0 0 18px -6px rgba(0,230,153,0.45)" },
          "50%": { boxShadow: "0 0 0 1px rgba(0,230,153,0.5), 0 0 36px -4px rgba(0,230,153,0.7)" },
        },
        "danger-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 1px rgba(244,63,94,0.4), 0 0 12px -4px rgba(244,63,94,0.5)", transform: "scale(1)" },
          "50%": { boxShadow: "0 0 0 2px rgba(244,63,94,0.8), 0 0 36px 0 rgba(244,63,94,0.75)", transform: "scale(1.03)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "shake-x": {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-6px)" },
          "40%, 80%": { transform: "translateX(6px)" },
        },
      },
      animation: {
        "border-spin": "border-spin 4s linear infinite",
        "border-spin-fast": "border-spin 2s linear infinite",
        "gradient-x": "gradient-x 6s ease infinite",
        shimmer: "shimmer 2.2s ease-in-out infinite",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.215,0.61,0.355,1) infinite",
        "glow-pulse": "glow-pulse 2.4s ease-in-out infinite",
        "danger-pulse": "danger-pulse 1s ease-in-out infinite",
        float: "float 5s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out both",
        "shake-x": "shake-x 0.45s ease-in-out",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities, addComponents }) => {
      addUtilities({
        ".no-select": {
          "-webkit-user-select": "none",
          "-moz-user-select": "none",
          "user-select": "none",
          "-webkit-touch-callout": "none",
        },
        ".text-balance": { "text-wrap": "balance" },
        ".scrollbar-thin": {
          "scrollbar-width": "thin",
          "scrollbar-color": "#374151 transparent",
        },
      });
      addComponents({
        // Glass surface used by cards, nav and modals
        ".glass": {
          background: "linear-gradient(180deg, rgba(31,41,55,0.72) 0%, rgba(17,24,39,0.62) 100%)",
          "-webkit-backdrop-filter": "blur(14px) saturate(140%)",
          "backdrop-filter": "blur(14px) saturate(140%)",
          border: "1px solid rgba(255,255,255,0.06)",
        },
        // Animated conic-gradient border. Needs `--border-angle` registered in globals.css.
        ".border-animated": {
          border: "1px solid transparent",
          background:
            "linear-gradient(#111827, #111827) padding-box, conic-gradient(from var(--border-angle), rgba(31,41,55,0.9) 0%, rgba(31,41,55,0.9) 60%, #00E699 75%, #67E8F9 82%, #6366F1 90%, rgba(31,41,55,0.9) 100%) border-box",
        },
        ".text-gradient": {
          "background-image":
            "linear-gradient(90deg, #FFFFFF 0%, #B8FFE6 40%, #00E699 70%, #67E8F9 100%)",
          "-webkit-background-clip": "text",
          "background-clip": "text",
          color: "transparent",
        },
      });
    }),
  ],
};
