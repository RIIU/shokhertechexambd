/**
 * ShokherTech Exam BD — Design tokens
 * -----------------------------------------------------------------------------
 * Colors are sampled pixel-for-pixel from pixxen.com: deep forest-green
 * backgrounds, an electric lime primary (#99FE00), a leaf-green secondary
 * (#19CC61) and sage text (#A7BDB5). Exact values cross-checked against
 * pixxen.com's page source (green1–green5, dark-shade tokens).
 *
 * Fonts are loaded with next/font in app/layout.tsx and exposed as CSS
 * variables, so this file only maps them to families.
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
        // Electric lime — primary (pixxen CTA buttons)
        brand: {
          50: "#F5FFE6",
          100: "#E6FFC2",
          200: "#CCFF85",
          300: "#B3FE47",
          400: "#99FE00", // signature
          500: "#85DE00",
          600: "#6AB300",
          700: "#4F8500",
          800: "#355900",
          900: "#1A2C00",
          DEFAULT: "#99FE00",
        },
        // Leaf green — secondary (pixxen labels, dots, icons)
        leaf: {
          300: "#5EE596",
          400: "#19CC61", // pixxen green2
          500: "#19B357",
          600: "#19914A",
          DEFAULT: "#19CC61",
        },
        // Dark green fills and text on lime buttons (pixxen #065136)
        forest: {
          DEFAULT: "#065136",
        },
        // Backgrounds & surfaces (pixxen)
        obsidian: {
          950: "#001B11", // section gradient end, modal scrims
          900: "#002417", // app background
          800: "#012819", // header, raised surfaces
          DEFAULT: "#002417",
        },
        surface: {
          DEFAULT: "#042E1B", // hero top / chips
          soft: "#012819",
          hover: "#0A3C26",
          border: "#29473C", // card borders (pixxen dark-shade3)
          pill: "#1F382F", // pills, icon buttons
        },
        ink: {
          DEFAULT: "#FFFFFF",
          muted: "#A7BDB5",
          subtle: "#759187", // pixxen meta text
        },
        // Semantic exam states
        state: {
          answered: "#99FE00",
          flagged: "#F59E0B",
          unanswered: "#29473C",
          danger: "#F43F5E",
        },
      },
      // Line heights tuned for Bangla (Baloo Da 2): matras and conjuncts need
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
        // sentence stay in Inter while Bangla letters and ০–৯ use Baloo Da 2.
        bangla: ["var(--font-inter)", "var(--font-bangla)", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      backgroundImage: {
        // pixxen hero: lighter green band behind the header
        hero: "linear-gradient(180deg, #042E1B 0%, #09351F 55%, #063B25 100%)",
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "radial-brand":
          "radial-gradient(60% 60% at 50% 0%, rgba(26,120,52,0.35) 0%, rgba(0,36,23,0) 70%)",
        "radial-glow":
          "radial-gradient(50% 50% at 50% 50%, rgba(153,254,0,0.14) 0%, rgba(0,36,23,0) 70%)",
        "brand-gradient": "linear-gradient(135deg, #99FE00 0%, #5EE596 50%, #19CC61 100%)",
        "text-gradient": "linear-gradient(90deg, #FFFFFF 0%, #E6FFC2 35%, #99FE00 70%, #19CC61 100%)",
        // pixxen section background
        section: "linear-gradient(180deg, #002417 0%, #001B11 100%)",
        // pixxen popup panel
        "radial-forest": "radial-gradient(15.93% 43.85% at 50% 100%, #065136 0%, #002417 100%)",
      },
      backgroundSize: {
        grid: "48px 48px",
      },
      boxShadow: {
        "glow-sm": "0 0 0 1px rgba(153,254,0,0.15), 0 0 12px -2px rgba(153,254,0,0.35)",
        glow: "0 0 0 1px rgba(153,254,0,0.25), 0 0 32px -6px rgba(153,254,0,0.45)",
        "glow-lg": "0 0 0 1px rgba(153,254,0,0.3), 0 0 60px -10px rgba(153,254,0,0.5)",
        "glow-leaf": "0 0 0 1px rgba(25,204,97,0.3), 0 0 40px -8px rgba(25,204,97,0.5)",
        "glow-danger": "0 0 0 1px rgba(244,63,94,0.4), 0 0 32px -4px rgba(244,63,94,0.6)",
        card: "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 20px 40px -24px rgba(0,10,5,0.85)",
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
          "0%, 100%": { boxShadow: "0 0 0 1px rgba(153,254,0,0.25), 0 0 18px -6px rgba(153,254,0,0.45)" },
          "50%": { boxShadow: "0 0 0 1px rgba(153,254,0,0.5), 0 0 36px -4px rgba(153,254,0,0.7)" },
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
          "scrollbar-color": "#29473C transparent",
        },
      });
      addComponents({
        // Glass surface used by cards, nav and modals
        ".glass": {
          background: "linear-gradient(180deg, rgba(4,46,27,0.82) 0%, rgba(1,40,25,0.74) 100%)",
          "-webkit-backdrop-filter": "blur(14px) saturate(140%)",
          "backdrop-filter": "blur(14px) saturate(140%)",
          border: "1px solid rgba(41,71,60,0.9)",
        },
        // Animated conic-gradient border. Needs `--border-angle` registered in globals.css.
        ".border-animated": {
          border: "1px solid transparent",
          background:
            "radial-gradient(15.93% 43.85% at 50% 100%, #065136 0%, #002417 100%) padding-box, conic-gradient(from var(--border-angle), #29473C 0%, #29473C 60%, #99FE00 75%, #19CC61 84%, #065136 92%, #29473C 100%) border-box",
        },
        ".text-gradient": {
          "background-image":
            "linear-gradient(90deg, #FFFFFF 0%, #E6FFC2 35%, #99FE00 70%, #19CC61 100%)",
          "-webkit-background-clip": "text",
          "background-clip": "text",
          color: "transparent",
        },
      });
    }),
  ],
};
