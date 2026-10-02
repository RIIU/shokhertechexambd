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
    bg: "bg-brand-400/10",
    border: "border-brand-400/30",
    ring: "ring-brand-400/40",
    glow: "group-hover:shadow-glow",
    hex: "#99FE00",
  },
  leaf: {
    text: "text-leaf-400",
    bg: "bg-leaf-400/10",
    border: "border-leaf-400/30",
    ring: "ring-leaf-400/40",
    glow: "group-hover:shadow-glow-leaf",
    hex: "#19CB61",
  },
  teal: {
    text: "text-teal-300",
    bg: "bg-teal-400/10",
    border: "border-teal-400/30",
    ring: "ring-teal-400/40",
    glow: "group-hover:shadow-[0_0_0_1px_rgba(45,212,191,0.3),0_0_40px_-8px_rgba(45,212,191,0.5)]",
    hex: "#2DD4BF",
  },
  amber: {
    text: "text-amber-300",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
    ring: "ring-amber-400/40",
    glow: "group-hover:shadow-[0_0_0_1px_rgba(251,191,36,0.3),0_0_40px_-8px_rgba(251,191,36,0.45)]",
    hex: "#FBBF24",
  },
  rose: {
    text: "text-rose-300",
    bg: "bg-rose-400/10",
    border: "border-rose-400/30",
    ring: "ring-rose-400/40",
    glow: "group-hover:shadow-[0_0_0_1px_rgba(251,113,133,0.3),0_0_40px_-8px_rgba(251,113,133,0.45)]",
    hex: "#FB7185",
  },
  violet: {
    text: "text-violet-300",
    bg: "bg-violet-400/10",
    border: "border-violet-400/30",
    ring: "ring-violet-400/40",
    glow: "group-hover:shadow-[0_0_0_1px_rgba(167,139,250,0.3),0_0_40px_-8px_rgba(167,139,250,0.45)]",
    hex: "#A78BFA",
  },
};
