/**
 * Draws the shareable result card (1200×630) on a canvas in the browser.
 * The browser shapes Bangla text correctly (conjuncts, vowel signs), which
 * server-side image renderers don't, so the downloadable image is made here.
 */
import { formatClock, toBn } from "@/lib/utils";

export interface ResultCardData {
  name: string;
  institution?: string;
  titleBn: string;
  subtitle?: string;
  score: number;
  total: number;
  rank: number;
  participants: number;
  accuracy: number;
  timeTakenSec: number;
  verdict: string;
  host: string;
}

const W = 1200;
const H = 630;
const C = {
  bg: "#001B11",
  card: "#012819",
  border: "#29473C",
  ink: "#FFFFFF",
  muted: "#A7BDB5",
  subtle: "#759187",
  brand: "#99FE00",
  brandLight: "#19CC61",
  brandTint: "rgba(153,254,0,0.12)",
  onBrand: "#065136",
  panel: "#042E1B",
  track: "rgba(255,255,255,0.08)",
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Shrinks the font until the text fits, then ellipsizes as a last resort. */
function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, weight: number, size: number, min: number, family: string) {
  let s = size;
  ctx.font = `${weight} ${s}px ${family}`;
  while (ctx.measureText(text).width > maxWidth && s > min) {
    s -= 2;
    ctx.font = `${weight} ${s}px ${family}`;
  }
  let t = text;
  while (ctx.measureText(t).width > maxWidth && t.length > 1) t = t.slice(0, -2) + "…";
  return t;
}

/** The page's own font stack (Inter for Latin, Hind Siliguri for Bangla). */
function pageFontFamily(): string {
  const probe = document.querySelector('[lang="bn"]') ?? document.body;
  return getComputedStyle(probe).fontFamily || "sans-serif";
}

export async function drawResultCard(d: ResultCardData): Promise<Blob> {
  await document.fonts?.ready;
  const family = pageFontFamily();
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.textBaseline = "alphabetic";

  // Page + card
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.shadowColor = "rgba(0,10,5,0.6)";
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 10;
  roundRect(ctx, 40, 40, W - 80, H - 80, 32);
  ctx.fillStyle = C.card;
  ctx.fill();
  ctx.restore();
  roundRect(ctx, 40, 40, W - 80, H - 80, 32);
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Brand
  roundRect(ctx, 88, 84, 52, 52, 14);
  ctx.fillStyle = C.brand;
  ctx.fill();
  ctx.fillStyle = C.onBrand;
  ctx.font = `800 18px ${family}`;
  ctx.textAlign = "center";
  ctx.fillText("STA", 114, 117);
  ctx.textAlign = "left";
  ctx.fillStyle = C.ink;
  ctx.font = `700 24px ${family}`;
  ctx.fillText("Shokher Tech Academy", 156, 119);

  // Title block
  const leftW = 640;
  if (d.subtitle) {
    ctx.fillStyle = C.subtle;
    ctx.fillText(fitText(ctx, d.subtitle, leftW, 500, 24, 18, family), 88, 196);
  }
  ctx.fillStyle = C.ink;
  ctx.fillText(fitText(ctx, d.titleBn, leftW, 700, 42, 28, family), 88, 248);

  // Verdict pill
  ctx.font = `600 22px ${family}`;
  const vw = ctx.measureText(d.verdict).width + 40;
  roundRect(ctx, 88, 278, vw, 44, 22);
  ctx.fillStyle = C.brandTint;
  ctx.fill();
  ctx.fillStyle = C.brand;
  ctx.fillText(d.verdict, 108, 308);

  // Stats row
  const stats = [
    { label: "র‍্যাংক", value: `#${toBn(d.rank)}`, sub: `${toBn(d.participants)} জনের মধ্যে` },
    { label: "নির্ভুলতা", value: `${toBn(d.accuracy)}%`, sub: "সঠিক উত্তরের হার" },
    { label: "সময়", value: formatClock(d.timeTakenSec), sub: "মিনিট:সেকেন্ড" },
  ];
  stats.forEach((s, i) => {
    const x = 88 + i * 214;
    const y = 360;
    roundRect(ctx, x, y, 196, 120, 18);
    ctx.fillStyle = C.panel;
    ctx.fill();
    ctx.fillStyle = C.subtle;
    ctx.font = `500 20px ${family}`;
    ctx.fillText(s.label, x + 20, y + 36);
    ctx.fillStyle = C.ink;
    ctx.font = `700 36px ${family}`;
    ctx.fillText(s.value, x + 20, y + 80);
    ctx.fillStyle = C.subtle;
    ctx.font = `400 17px ${family}`;
    ctx.fillText(s.sub, x + 20, y + 106);
  });

  // Student
  ctx.fillStyle = C.ink;
  ctx.fillText(fitText(ctx, d.name, 420, 600, 24, 18, family), 88, 540);
  if (d.institution) {
    ctx.fillStyle = C.subtle;
    const name = ctx.measureText(d.name).width;
    ctx.fillText(fitText(ctx, `· ${d.institution}`, 560 - name, 400, 22, 16, family), 88 + name + 12, 540);
  }

  // Score ring
  const cx = 930;
  const cy = 300;
  const r = 150;
  const pct = d.total > 0 ? Math.max(0, Math.min(1, d.score / d.total)) : 0;
  ctx.lineWidth = 26;
  ctx.lineCap = "round";
  ctx.strokeStyle = C.track;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  if (pct > 0) {
    const grad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    grad.addColorStop(0, C.brand);
    grad.addColorStop(1, C.brandLight);
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
    ctx.stroke();
  }
  ctx.textAlign = "center";
  ctx.fillStyle = C.ink;
  const scoreText = toBn(Number(d.score.toFixed(2)));
  ctx.font = `700 92px ${family}`;
  const sw = ctx.measureText(scoreText).width;
  ctx.font = `600 36px ${family}`;
  const tw = ctx.measureText(`/${toBn(d.total)}`).width;
  const start = cx - (sw + tw) / 2;
  ctx.textAlign = "left";
  ctx.font = `700 92px ${family}`;
  ctx.fillText(scoreText, start, cy + 22);
  ctx.fillStyle = C.subtle;
  ctx.font = `600 36px ${family}`;
  ctx.fillText(`/${toBn(d.total)}`, start + sw + 4, cy + 22);
  ctx.textAlign = "center";
  ctx.font = `500 22px ${family}`;
  ctx.fillText("প্রাপ্ত নম্বর", cx, cy + 62);

  // Footer link
  ctx.fillStyle = C.brand;
  ctx.font = `600 22px ${family}`;
  ctx.fillText(d.host, cx, 540);
  ctx.textAlign = "left";

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"));
}
