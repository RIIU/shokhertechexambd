"use client";

import { useRef, useState, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

interface GsapRevealProps {
  children: ReactNode;
  className?: string;
  /** Delay before the first element animates, in seconds. */
  delay?: number;
  stagger?: number;
}

/**
 * Staggers every descendant marked `data-reveal` into view when the component
 * enters the viewport (IntersectionObserver), not on mount.
 */
export function GsapReveal({ children, className, delay = 0, stagger = 0.08 }: GsapRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.15 },
      );
      observer.observe(el);
      return () => observer.disconnect();
    },
    { scope: ref },
  );

  useGSAP(
    () => {
      if (!visible) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-reveal]", {
          opacity: 0,
          y: 28,
          filter: "blur(6px)",
          duration: 0.8,
          ease: "power3.out",
          stagger,
          delay,
          clearProps: "filter",
        });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [visible] },
  );

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
