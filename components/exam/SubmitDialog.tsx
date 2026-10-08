"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2, Send } from "lucide-react";
import { toBn } from "@/lib/utils";

interface SubmitDialogProps {
  open: boolean;
  answered: number;
  flagged: number;
  total: number;
  negativeMark: number;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function SubmitDialog({ open, answered, flagged, total, negativeMark, submitting, onCancel, onConfirm }: SubmitDialogProps) {
  const unanswered = total - answered;
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-obsidian-950/75 p-4 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={submitting ? undefined : onCancel}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 40, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            className="border-animated w-full max-w-md rounded-3xl p-6 animate-border-spin"
          >
            <h2 id="submit-title" lang="bn" className="mb-1 text-xl font-bold text-ink">
              পরীক্ষা জমা দিতে চাও?
            </h2>
            <p lang="bn" className="mb-5 text-sm text-ink-muted">
              জমা দেওয়ার পর আর কোনো উত্তর পরিবর্তন করা যাবে না।
            </p>

            <dl className="mb-5 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "উত্তর দেওয়া", value: answered, cls: "text-brand-300" },
                { label: "চিহ্নিত", value: flagged, cls: "text-amber-300" },
                { label: "বাকি", value: unanswered, cls: "text-ink" },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-surface-border bg-white/[0.02] py-3">
                  <dt lang="bn" className="text-[11px] text-ink-muted">
                    {s.label}
                  </dt>
                  <dd lang="bn" className={`font-display text-2xl font-bold ${s.cls}`}>
                    {toBn(s.value)}
                  </dd>
                </div>
              ))}
            </dl>

            {unanswered > 0 && (
              <p lang="bn" className="mb-3 flex items-start gap-2 rounded-xl bg-amber-400/10 p-3 text-xs text-amber-200 ring-1 ring-amber-400/25">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
                এখনো {toBn(unanswered)}টি প্রশ্নের উত্তর দেওয়া হয়নি। উত্তর না দিলে {toBn(unanswered)}টির জন্য ০ নম্বর থাকবে।
              </p>
            )}

            {negativeMark > 0 && (
              <p lang="bn" className="mb-5 flex items-start gap-2 rounded-xl bg-state-danger/10 p-3 text-xs text-rose-200 ring-1 ring-state-danger/25">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />
                প্রতিটি <strong className="font-semibold">ভুল</strong> উত্তরে {toBn(negativeMark)} নম্বর কাটা যাবে। নিশ্চিত না হলে উত্তর না দেওয়াই ভালো।
              </p>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={onCancel} disabled={submitting} className="btn-ghost flex-1">
                <span lang="bn">ফিরে যাও</span>
              </button>
              <button type="button" onClick={onConfirm} disabled={submitting} className="btn-primary flex-1" autoFocus>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" strokeWidth={1.5} />}
                <span lang="bn">{submitting ? "জমা হচ্ছে…" : "জমা দাও"}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
