import type { Level } from "@/lib/types";

export interface Testimonial {
  quote: string;
  name: string;
  /** Shown as "SSC · বিজ্ঞান" style meta. */
  level: Level;
  detail?: string;
}

/**
 * Only genuine, permission-granted quotes belong here — the landing page hides
 * the whole section while this is empty. Ask the student (or their guardian) for
 * written consent before adding a real name.
 */
export const TESTIMONIALS: Testimonial[] = [];
