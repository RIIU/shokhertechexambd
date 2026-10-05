/**
 * ShokherTech Exam BD — Design tokens
 * -----------------------------------------------------------------------------
 * Clean, light and minimal: off-white page, white cards with hairline borders,
 * one confident green for actions, soft shadows instead of glows.
 *
 * Token names (obsidian = page/raised backgrounds, surface = cards, ink = text,
 * brand = primary) are kept from the old dark theme so every component picks
 * up the new look from here. Shades that the dark theme used as "light text
 * on dark" (200/300) now hold the darker tones a light page needs.
 *
 * Fonts are loaded with next/font in app/layout.tsx and exposed as CSS
 * variables, so this file only maps them to families.
 */
const plugin = require("tailwindcss/plugin");
const colors = require("tailwindcss/colors");

/** Same palette with the light shades swapped for readable-on-white ones. */
const forLight = (c) => ({ ...c, 200: c[800], 300: c[700], 400: c[600] });

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
        // Primary green. 400 is the action colour (white text on it is 5:1).
        brand: {
          50: "#ECFDF3",
          100: "#D1FADF",
          200: "#05603A", // text on light tints
          300: "#067647", // links, small accents
          400: "#08804A", // signature: buttons, active states
          500: "#0A9456",
          600: "#12B76A",
          700: "#6CE9A6",
          800: "#A6F4C5",
          900: "#D1FADF",
          950: "#ECFDF3",
          DEFAULT: "#08804A",
        },
        // Secondary green for small labels and dots
        leaf: {
          300: "#067647",
          400: "#12B76A",
          500: "#0E9F5C",
          600: "#067647",
          DEFAULT: "#12B76A",
        },
        // Text/icons on primary fills
        forest: {
          DEFAULT: "#FFFFFF",
        },
        // Page and raised backgrounds; 950 is the recessed panel inside a card
        obsidian: {
          950: "#F2F4F7",
          900: "#F6F7F9", // page background
          800: "#FFFFFF", // header, raised surfaces
          700: "#EEF1F4",
          DEFAULT: "#F6F7F9",
        },
        // Dark overlay behind modals and sheets
        scrim: "#0B1220",
        surface: {
          DEFAULT: "#FFFFFF",
          soft: "#F9FAFB",
          hover: "#F2F4F7",
          border: "#E4E7EC",
          pill: "#F2F4F7",
        },
        ink: {
          DEFAULT: "#101828",
          muted: "#475467",
          subtle: "#667085",
        },
        // Semantic exam states
        state: {
          answered: "#08804A",
          flagged: "#F79009",
          unanswered: "#E4E7EC",
          danger: "#E11D48",
        },
        rose: forLight(colors.rose),
        amber: forLight(colors.amber),
        emerald: forLight(colors.emerald),
        teal: forLight(colors.teal),
      },
      // Line heights tuned for Bangla (Hind Siliguri): matras and conjuncts need
      // more room than Latin in body text, while big headings need much less
      // than body text so multi-line titles stay one visual block.
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.5" }],
        sm: ["0.875rem", { lineHeight: "1.55" }],
        base: ["1rem", { lineHeight: "1.6" }],
        lg: ["1.125rem", { lineHeight: "1.55" }],
        xl: ["1.25rem", { lineHeight: "1.45" }],
        "2xl": ["1.5rem", { lineHeight: "1.35" }],
        "3xl": ["1.875rem", { lineHeight: "1.3" }],
        "4xl": ["2.25rem", { lineHeight: "1.25" }],
        "5xl": ["3rem", { lineHeight: "1.2" }],
        "6xl": ["3.75rem", { lineHeight: "1.18" }],
        "7xl": ["4.5rem", { lineHeight: "1.15" }],
        "8xl": ["6rem", { lineHeight: "1.1" }],
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-bangla)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "var(--font-inter)", "system-ui", "sans-serif"],
        // Every Bangla string uses this family. Inter comes first and has no
        // Bengali glyphs, so English words and Latin digits inside a Bangla
        // sentence stay in Inter while Bangla letters and ০–৯ use Hind Siliguri.
        bangla: ["var(--font-inter)", "var(--font-bangla)", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      backgroundImage: {
        hero: "linear-gradient(180deg, #FFFFFF 0%, #F6F7F9 100%)",
        "grid-faint":
          "linear-gradient(to right, rgba(16,24,40,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,24,40,0.035) 1px, transparent 1px)",
        "radial-brand":
          "radial-gradient(60% 60% at 50% 0%, rgba(18,183,106,0.10) 0%, rgba(246,247,249,0) 70%)",
        "radial-glow":
          "radial-gradient(50% 50% at 50% 50%, rgba(18,183,106,0.10) 0%, rgba(246,247,249,0) 70%)",
        "brand-gradient": "linear-gradient(135deg, #08804A 0%, #12B76A 100%)",
        "text-gradient": "linear-gradient(90deg, #05603A 0%, #08804A 50%, #12B76A 100%)",
        section: "linear-gradient(180deg, #F6F7F9 0%, #FFFFFF 100%)",
        "radial-forest": "linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 100%)",
      },
      backgroundSize: {
        grid: "48px 48px",
      },
      boxShadow: {
        "glow-sm": "0 1px 2px 0 rgba(16,24,40,0.05)",
        glow: "0 1px 2px 0 rgba(16,24,40,0.06), 0 4px 12px -4px rgba(8,128,74,0.25)",
        "glow-lg": "0 2px 4px -1px rgba(16,24,40,0.06), 0 12px 24px -8px rgba(8,128,74,0.30)",
        "glow-leaf": "0 1px 2px 0 rgba(16,24,40,0.06), 0 8px 20px -8px rgba(18,183,106,0.30)",
        "glow-danger": "0 0 0 1px rgba(225,29,72,0.25), 0 8px 20px -8px rgba(225,29,72,0.35)",
        card: "0 1px 2px 0 rgba(16,24,40,0.04), 0 1px 3px 0 rgba(16,24,40,0.06)",
        lift: "0 12px 24px -12px rgba(16,24,40,0.18)",
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
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(8,128,74,0.25)" },
          "50%": { boxShadow: "0 0 0 6px rgba(8,128,74,0)" },
        },
        "danger-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(225,29,72,0.35)", transform: "scale(1)" },
          "50%": { boxShadow: "0 0 0 6px rgba(225,29,72,0)", transform: "scale(1.02)" },
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
          "scrollbar-color": "#D0D5DD transparent",
        },
      });
      addComponents({
        // Frosted white surface used by nav, toolbars and modals
        ".glass": {
          background: "rgba(255,255,255,0.86)",
          "-webkit-backdrop-filter": "blur(12px) saturate(160%)",
          "backdrop-filter": "blur(12px) saturate(160%)",
          border: "1px solid #E4E7EC",
        },
        // Animated conic-gradient border (live items). Needs `--border-angle` registered in globals.css.
        ".border-animated": {
          border: "1.5px solid transparent",
          background:
            "linear-gradient(#FFFFFF, #FFFFFF) padding-box, conic-gradient(from var(--border-angle), #E4E7EC 0%, #E4E7EC 55%, #12B76A 72%, #08804A 82%, #E4E7EC 95%) border-box",
        },
        ".text-gradient": {
          "background-image": "linear-gradient(90deg, #05603A 0%, #08804A 50%, #12B76A 100%)",
          "-webkit-background-clip": "text",
          "background-clip": "text",
          color: "transparent",
        },
      });
    }),
  ],
};
