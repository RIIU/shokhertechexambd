import type { Accent } from "./types";

/**
 * Static class maps per accent so Tailwind's JIT can see every class name.
 * Never build these strings dynamically (e.g. `text-${accent}-400`).
 */
export const ACCENT_STYLES: Record<
  Accent,
  { text: string; bg: string; border: string; ring: string; glow: string; hex: string }
> = {
  brand: {
    text: "text-brand-400",
    bg: "bg-brand-50",
    border: "border-brand-400/30",
    ring: "ring-brand-400/15",
    glow: "hover:shadow-lift",
    hex: "#08804A",
  },
  leaf: {
    text: "text-leaf-500",
    bg: "bg-emerald-50",
    border: "border-leaf-400/30",
    ring: "ring-leaf-400/20",
    glow: "hover:shadow-lift",
    hex: "#12B76A",
  },
  teal: {
    text: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-400/30",
    ring: "ring-teal-500/15",
    glow: "hover:shadow-lift",
    hex: "#0D9488",
  },
  amber: {
    text: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-400/30",
    ring: "ring-amber-500/15",
    glow: "hover:shadow-lift",
    hex: "#D97706",
  },
  rose: {
    text: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-400/30",
    ring: "ring-rose-500/15",
    glow: "hover:shadow-lift",
    hex: "#E11D48",
  },
  violet: {
    text: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-400/30",
    ring: "ring-violet-500/15",
    glow: "hover:shadow-lift",
    hex: "#7C3AED",
  },
};
