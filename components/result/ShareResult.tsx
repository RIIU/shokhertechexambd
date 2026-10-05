"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Download, Facebook, Loader2, MessageCircle, Share2, X } from "lucide-react";
import { drawResultCard, type ResultCardData } from "@/lib/result-card";
import { toBn } from "@/lib/utils";

interface ShareResultProps {
  /** `/share/<attemptId>?t=<token>` from the server. */
  sharePath: string;
  title: string;
  score: number;
  total: number;
  rank: number;
  participants: number;
  /** Everything the downloadable card shows (the host is added here). */
  card: Omit<ResultCardData, "host">;
}

/** "Share" button + sheet: result card preview, social links, copy link and image download. */
export function ShareResult({ sharePath, title, score, total, rank, participants, card }: ShareResultProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [origin, setOrigin] = useState("");
  const [image, setImage] = useState<{ blob: Blob; url: string } | null>(null);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const cardRef = useRef(card);
  cardRef.current = card;

  useEffect(() => {
    setOrigin(window.location.origin);
    setCanNativeShare("share" in navigator);
  }, []);

  // Draw the card the first time the sheet opens.
  useEffect(() => {
    if (!open || image) return;
    let cancelled = false;
    drawResultCard({ ...cardRef.current, host: window.location.host })
      .then((blob) => !cancelled && setImage({ blob, url: URL.createObjectURL(blob) }))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, image]);
  useEffect(() => () => {
    if (image) URL.revokeObjectURL(image.url);
  }, [image]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const url = `${origin}${sharePath}`;
  const text = `"${title}" পরীক্ষায় আমি পেয়েছি ${toBn(score)}/${toBn(total)}, র‍্যাংক #${toBn(rank)} (${toBn(participants)} জনের মধ্যে)। তুমিও পরীক্ষা দাও!`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("লিংকটি কপি করো", url);
    }
  };

  // Phones: share the card image itself when the browser allows files, else the link.
  const nativeShare = async () => {
    setSharing(true);
    try {
      const file = image && new File([image.blob], "result.png", { type: "image/png" });
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `${text}\n${url}` });
      } else {
        await navigator.share({ title, text, url });
      }
    } catch {
      // cancelled or unsupported: the buttons below still work
    } finally {
      setSharing(false);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary">
        <Share2 className="h-4 w-4" strokeWidth={1.75} />
        <span lang="bn">ফলাফল শেয়ার করো</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center bg-scrim/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="share-title"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-lift sm:rounded-3xl sm:p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 id="share-title" lang="bn" className="text-lg font-bold text-ink">
                  ফলাফল শেয়ার করো
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="বন্ধ করো"
                  className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-hover hover:text-ink"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4 aspect-[1200/630] w-full overflow-hidden rounded-2xl bg-surface-hover ring-1 ring-surface-border">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image.url} alt="ফলাফল কার্ড" width={1200} height={630} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-ink-subtle" />
                  </div>
                )}
              </div>

              {canNativeShare && (
                <button type="button" onClick={nativeShare} disabled={sharing} className="btn-primary mb-3 w-full py-3">
                  {sharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
                  <span lang="bn">ছবিসহ শেয়ার করো</span>
                </button>
              )}

              <div className="grid grid-cols-4 gap-2">
                <ShareTile
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                  label="Facebook"
                  icon={<Facebook className="h-5 w-5" />}
                  tint="bg-[#1877F2]/10 text-[#1877F2]"
                />
                <ShareTile
                  href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
                  label="WhatsApp"
                  icon={<MessageCircle className="h-5 w-5" />}
                  tint="bg-[#25D366]/10 text-[#128C7E]"
                />
                <button type="button" onClick={copy} className="flex flex-col items-center gap-1.5 rounded-xl p-2 text-xs text-ink-muted hover:bg-surface-hover">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-hover text-ink">
                    {copied ? <Check className="h-5 w-5 text-brand-400" /> : <Copy className="h-5 w-5" />}
                  </span>
                  <span lang="bn">{copied ? "কপি হয়েছে" : "লিংক কপি"}</span>
                </button>
                <a
                  href={image?.url}
                  download="result.png"
                  aria-disabled={!image}
                  className="flex flex-col items-center gap-1.5 rounded-xl p-2 text-xs text-ink-muted hover:bg-surface-hover aria-disabled:pointer-events-none aria-disabled:opacity-50"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-hover text-ink">
                    <Download className="h-5 w-5" />
                  </span>
                  <span lang="bn">ছবি সেভ</span>
                </a>
              </div>

              <p lang="bn" className="mt-4 text-center text-xs text-ink-subtle">
                লিংকে শুধু তোমার স্কোর আর র‍্যাংক দেখা যাবে, উত্তর বা ফোন নম্বর নয়।
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ShareTile({ href, label, icon, tint }: { href: string; label: string; icon: React.ReactNode; tint: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-1.5 rounded-xl p-2 text-xs text-ink-muted hover:bg-surface-hover"
    >
      <span className={`flex h-11 w-11 items-center justify-center rounded-full ${tint}`}>{icon}</span>
      <span>{label}</span>
    </a>
  );
}
