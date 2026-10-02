"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface WatermarkProps {
  /** Lines stamped repeatedly across the screen, e.g. phone, IP, roll. */
  lines: string[];
  /** Called when the overlay is removed, hidden or made transparent via DevTools. */
  onTamper?: () => void;
  opacity?: number;
}

const TILE_W = 340;
const TILE_H = 210;

function renderTile(lines: string[], stamp: string, opacity: number): string {
  const canvas = document.createElement("canvas");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = TILE_W * dpr;
  canvas.height = TILE_H * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.scale(dpr, dpr);
  ctx.translate(TILE_W / 2, TILE_H / 2);
  ctx.rotate((-24 * Math.PI) / 180);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const all = [...lines, stamp];
  all.forEach((line, i) => {
    const y = (i - (all.length - 1) / 2) * 20;
    ctx.font = `${i === 0 ? 600 : 500} ${i === 0 ? 15 : 12}px Inter, system-ui, sans-serif`;
    // Dark outline + light fill keeps the mark readable on any background in a photo.
    ctx.lineWidth = 3;
    ctx.strokeStyle = `rgba(0,0,0,${opacity * 0.6})`;
    ctx.strokeText(line, 0, y);
    ctx.fillStyle = `rgba(255,255,255,${opacity})`;
    ctx.fillText(line, 0, y);
  });

  return canvas.toDataURL("image/png");
}

/**
 * Full-screen, click-through watermark. Identifies the candidate in any photo
 * or screen recording, so leaked questions can be traced back to an account.
 */
export function Watermark({ lines, onTamper, opacity = 0.07 }: WatermarkProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onTamperRef = useRef(onTamper);
  onTamperRef.current = onTamper;

  // Refresh the timestamp every minute so a photo also reveals *when* it was taken.
  const [stamp, setStamp] = useState(() => new Date().toLocaleString("en-GB"));
  useEffect(() => {
    const id = window.setInterval(() => setStamp(new Date().toLocaleString("en-GB")), 60_000);
    return () => window.clearInterval(id);
  }, []);

  const linesKey = lines.join("\n");
  const [tile, setTile] = useState("");
  useEffect(() => {
    setTile(renderTile(linesKey.split("\n"), stamp, opacity));
  }, [linesKey, stamp, opacity]);

  const backgroundImage = useMemo(() => (tile ? `url(${tile})` : undefined), [tile]);

  // Integrity check: if someone deletes or hides the overlay in DevTools, report it.
  useEffect(() => {
    const node = ref.current;
    const parent = node?.parentElement;
    if (!node || !parent) return;

    const check = () => {
      const style = window.getComputedStyle(node);
      const broken =
        !node.isConnected ||
        style.display === "none" ||
        style.visibility === "hidden" ||
        Number(style.opacity) < 0.5 ||
        !node.style.backgroundImage;
      if (broken) onTamperRef.current?.();
    };

    const observer = new MutationObserver(check);
    observer.observe(node, { attributes: true, attributeFilter: ["style", "class", "hidden"] });
    observer.observe(parent, { childList: true });
    return () => observer.disconnect();
  }, [tile]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-watermark
      className="pointer-events-none fixed -inset-[50%] z-[70] select-none animate-[wm-drift_90s_linear_infinite] print:hidden"
      style={{ backgroundImage, backgroundRepeat: "repeat", backgroundSize: `${TILE_W}px ${TILE_H}px` }}
    >
      <style>{`@keyframes wm-drift{from{transform:translate3d(0,0,0)}to{transform:translate3d(${TILE_W}px,${TILE_H}px,0)}}`}</style>
    </div>
  );
}
