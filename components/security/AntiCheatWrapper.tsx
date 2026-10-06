"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldAlert, ShieldX } from "lucide-react";
import { Watermark } from "./Watermark";
import { cn, toBn } from "@/lib/utils";
import type { ViolationEvent, ViolationKind } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/*  Types & context                                                           */
/* -------------------------------------------------------------------------- */

export interface AntiCheatWrapperProps {
  children: ReactNode;
  /** Enforce rules only while the exam is running (not on the rules screen or after submit). */
  active: boolean;
  /** Strikes (tab switch / focus loss / fullscreen exit) allowed before forced submission. */
  maxWarnings?: number;
  /** Restores the strike count after a page refresh, so reloading never resets it. */
  initialStrikes?: number;
  /** Treat leaving fullscreen as a strike (only once fullscreen was actually entered). */
  enforceFullscreen?: boolean;
  /** Lines for the identity watermark. Omit to disable the overlay. */
  watermarkLines?: string[];
  /** Endpoint that receives every event via navigator.sendBeacon. */
  reportEndpoint?: string;
  onViolation?: (event: ViolationEvent, strikes: number) => void;
  /** Fired exactly once when strikes reach maxWarnings. Submit the exam here. */
  onMaxWarnings?: () => void;
  /** Extra context for the admin log, e.g. which question was on screen. */
  context?: () => string | undefined;
  className?: string;
}

interface AntiCheatContextValue {
  strikes: number;
  maxWarnings: number;
  /** Must be called from a user gesture (click / keypress). */
  enterFullscreen: () => Promise<void>;
}

const AntiCheatContext = createContext<AntiCheatContextValue | null>(null);

export function useAntiCheat(): AntiCheatContextValue {
  const ctx = useContext(AntiCheatContext);
  if (!ctx) throw new Error("useAntiCheat must be used inside <AntiCheatWrapper>");
  return ctx;
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

/** Two events within this window (e.g. `blur` + `visibilitychange` from one tab switch) count once. */
const STRIKE_DEDUPE_MS = 1500;
const DEVTOOLS_GAP_PX = 170;
/** Viewport smaller than this share of the screen = split screen / side-by-side / floating window. */
const SPLIT_AREA_RATIO = 0.6;
/** How long the small viewport must persist before it counts (ignores brief resizes). */
const SPLIT_PERSIST_MS = 2000;
/** Page-level nodes that are not the app root but are expected; anything else at <html>/<body> level is foreign. */
const OWN_TAGS = new Set(["SCRIPT", "STYLE", "LINK", "META", "NOSCRIPT", "TEMPLATE", "NEXT-ROUTE-ANNOUNCER", "NEXTJS-PORTAL"]);

const TOAST_COPY: Partial<Record<ViolationKind, string>> = {
  "context-menu": "রাইট-ক্লিক পরীক্ষার সময় বন্ধ",
  clipboard: "কপি / পেস্ট পরীক্ষার সময় বন্ধ",
  "blocked-shortcut": "এই কী-বোর্ড শর্টকাট পরীক্ষার সময় বন্ধ",
  "devtools-open": "ডেভেলপার টুলস খোলা শনাক্ত হয়েছে — রিপোর্ট করা হলো",
  extension: "ব্রাউজার এক্সটেনশন শনাক্ত হয়েছে — রিপোর্ট করা হলো",
  "multi-screen": "একাধিক মনিটর শনাক্ত হয়েছে — রিপোর্ট করা হলো",
};

const STRIKE_COPY: Partial<Record<ViolationKind, string>> = {
  "tab-hidden": "তুমি পরীক্ষার ট্যাব থেকে অন্য ট্যাবে বা অ্যাপে গিয়েছিলে।",
  "window-blur": "পরীক্ষার উইন্ডো থেকে ফোকাস সরে গিয়েছিল।",
  "fullscreen-exit": "তুমি ফুলস্ক্রিন মোড থেকে বের হয়ে গিয়েছিলে।",
  "watermark-tamper": "পরীক্ষার নিরাপত্তা ওয়াটারমার্ক পরিবর্তনের চেষ্টা শনাক্ত হয়েছে।",
  "split-screen": "স্ক্রিন ভাগ করে বা ছোট উইন্ডোতে পাশে অন্য কিছু খোলা শনাক্ত হয়েছে।",
  extension: "পরীক্ষার পাতায় একটি এক্সটেনশন বা সহকারী টুল (যেমন AI) চালু হয়েছে।",
};

/** Returns a readable combo (e.g. "Ctrl+Shift+I") if the key event must be blocked. */
function blockedCombo(e: KeyboardEvent): string | null {
  const key = e.key.toLowerCase();
  const mod = e.ctrlKey || e.metaKey;

  if (key === "f12") return "F12";
  if (key === "printscreen") return "PrintScreen";
  // DevTools: Ctrl+Shift+I/J/C/K (Win/Linux), Cmd+Opt+I/J/C/U (macOS)
  if (mod && (e.shiftKey || e.altKey) && ["i", "j", "c", "k", "u"].includes(key)) {
    return `${e.metaKey ? "Cmd" : "Ctrl"}+${e.shiftKey ? "Shift" : "Opt"}+${key.toUpperCase()}`;
  }
  // Copy, paste, cut, select all, view source, save, print, find
  if (mod && ["c", "v", "x", "a", "u", "s", "p", "f"].includes(key)) {
    return `${e.metaKey ? "Cmd" : "Ctrl"}+${key.toUpperCase()}`;
  }
  return null;
}

function isFullscreen() {
  return Boolean(document.fullscreenElement);
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Wraps the exam canvas in a strict environment:
 *  - text selection, drag, right-click, copy/cut/paste and printing disabled
 *  - DevTools / view-source / save / print shortcuts blocked
 *  - tab switch, window blur and fullscreen exit counted as strikes; at
 *    `maxWarnings` strikes `onMaxWarnings` fires (auto-submit)
 *  - identity watermark with tamper detection
 *  - every event reported to `reportEndpoint` for the admin alert log
 *
 * Client-side measures raise the cost of cheating but cannot make it
 * impossible. The answer key stays on the server, and the strike log is
 * reviewed server-side.
 */
export function AntiCheatWrapper({
  children,
  active,
  maxWarnings = 3,
  initialStrikes = 0,
  enforceFullscreen = true,
  watermarkLines,
  reportEndpoint,
  onViolation,
  onMaxWarnings,
  context,
  className,
}: AntiCheatWrapperProps) {
  const [strikes, setStrikes] = useState(initialStrikes);
  const [warning, setWarning] = useState<ViolationKind | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [watermarkKey, setWatermarkKey] = useState(0);

  // Refs keep the single set of DOM listeners in sync with the latest props.
  const strikesRef = useRef(initialStrikes);
  const lastStrikeAt = useRef(0);
  const maxFired = useRef(initialStrikes >= maxWarnings);
  const wasFullscreen = useRef(false);
  /** True between `beforeunload` and the page actually going away (or the reload being cancelled). */
  const unloading = useRef(false);
  const activeRef = useRef(active);
  const propsRef = useRef({ onViolation, onMaxWarnings, reportEndpoint, maxWarnings, enforceFullscreen, context });
  activeRef.current = active;
  propsRef.current = { onViolation, onMaxWarnings, reportEndpoint, maxWarnings, enforceFullscreen, context };

  const report = useCallback((raw: ViolationEvent) => {
    const { reportEndpoint: url, onViolation: cb, context: ctx } = propsRef.current;
    const where = ctx?.();
    const event = where ? { ...raw, detail: [raw.detail, where].filter(Boolean).join(" · ") } : raw;
    cb?.(event, strikesRef.current);
    if (!url) return;
    const body = JSON.stringify(event);
    // sendBeacon survives the tab being hidden or closed; fetch keepalive is the fallback.
    if (!navigator.sendBeacon?.(url, new Blob([body], { type: "application/json" }))) {
      void fetch(url, { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(
        () => undefined,
      );
    }
  }, []);

  const notify = useCallback(
    (kind: ViolationKind, detail?: string) => {
      if (!activeRef.current) return;
      const text = TOAST_COPY[kind];
      if (text) setToast({ id: Date.now(), text });
      report({ kind, strike: false, detail, at: Date.now() });
    },
    [report],
  );

  const strike = useCallback(
    (kind: ViolationKind, detail?: string) => {
      if (!activeRef.current || maxFired.current) return;
      const now = Date.now();
      if (now - lastStrikeAt.current < STRIKE_DEDUPE_MS) return;
      lastStrikeAt.current = now;

      const next = strikesRef.current + 1;
      strikesRef.current = next;
      setStrikes(next);
      setWarning(kind);
      report({ kind, strike: true, detail, at: now });

      if (next >= propsRef.current.maxWarnings) {
        maxFired.current = true;
        propsRef.current.onMaxWarnings?.();
      }
    },
    [report],
  );

  const enterFullscreen = useCallback(async () => {
    if (!document.fullscreenEnabled || isFullscreen()) return;
    try {
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    } catch {
      // Denied or unsupported (e.g. iPhone Safari): fullscreen is then simply not enforced.
    }
  }, []);

  /* ---------------------------- DOM listeners ---------------------------- */
  useEffect(() => {
    const guard = (e: Event) => activeRef.current && e.preventDefault();

    const onContextMenu = (e: MouseEvent) => {
      if (!activeRef.current) return;
      e.preventDefault();
      notify("context-menu");
    };
    const onClipboard = (e: ClipboardEvent) => {
      if (!activeRef.current) return;
      e.preventDefault();
      notify("clipboard", e.type);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (!activeRef.current) return;
      const combo = blockedCombo(e);
      if (!combo) return;
      e.preventDefault();
      e.stopPropagation();
      notify("blocked-shortcut", combo);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      // PrintScreen never reaches keydown on Windows; wipe the clipboard best-effort.
      if (activeRef.current && e.key === "PrintScreen") {
        void navigator.clipboard?.writeText("").catch(() => undefined);
        notify("blocked-shortcut", "PrintScreen");
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") strike("tab-hidden");
    };
    const onBlur = () => strike("window-blur");
    const onFullscreenChange = () => {
      if (isFullscreen()) {
        wasFullscreen.current = true;
      } else if (wasFullscreen.current && propsRef.current.enforceFullscreen && !unloading.current) {
        // A reload also exits fullscreen; that is not a strike (the deadline keeps running regardless).
        strike("fullscreen-exit");
      }
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!activeRef.current) return;
      unloading.current = true;
      // If the student cancels the "leave page?" prompt, the page survives and this resets.
      window.setTimeout(() => {
        unloading.current = false;
      }, 1000);
      e.preventDefault();
      e.returnValue = "";
    };

    const opts = { capture: true } as const;
    document.addEventListener("contextmenu", onContextMenu, opts);
    document.addEventListener("copy", onClipboard, opts);
    document.addEventListener("cut", onClipboard, opts);
    document.addEventListener("paste", onClipboard, opts);
    document.addEventListener("selectstart", guard, opts);
    document.addEventListener("dragstart", guard, opts);
    document.addEventListener("keydown", onKeyDown, opts);
    document.addEventListener("keyup", onKeyUp, opts);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("blur", onBlur);
    window.addEventListener("beforeunload", onBeforeUnload);

    // DevTools heuristic: a docked panel shrinks the viewport relative to the window.
    // Browser zoom and side panels can trip it, so it is logged but never counted as a strike.
    let devtoolsOpen = false;
    const devtoolsTimer = window.setInterval(() => {
      const open =
        window.outerWidth - window.innerWidth > DEVTOOLS_GAP_PX ||
        window.outerHeight - window.innerHeight > DEVTOOLS_GAP_PX;
      if (open && !devtoolsOpen) notify("devtools-open");
      devtoolsOpen = open;
    }, 1500);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu, opts);
      document.removeEventListener("copy", onClipboard, opts);
      document.removeEventListener("cut", onClipboard, opts);
      document.removeEventListener("paste", onClipboard, opts);
      document.removeEventListener("selectstart", guard, opts);
      document.removeEventListener("dragstart", guard, opts);
      document.removeEventListener("keydown", onKeyDown, opts);
      document.removeEventListener("keyup", onKeyUp, opts);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.clearInterval(devtoolsTimer);
    };
  }, [notify, strike]);

  /* ------------------ Split screen, extensions, monitors ------------------ */
  useEffect(() => {
    if (!active) return;

    // Split screen / side-by-side window / floating window: the viewport becomes a
    // small part of the screen. Counted once per episode, after it persists.
    let smallSince = 0;
    let reported = false;
    const checkViewport = () => {
      const screenArea = window.screen.width * window.screen.height;
      const viewArea = window.innerWidth * window.innerHeight;
      const small = screenArea > 0 && viewArea / screenArea < SPLIT_AREA_RATIO;
      if (!small) {
        smallSince = 0;
        reported = false;
        return;
      }
      smallSince ||= Date.now();
      if (!reported && Date.now() - smallSince >= SPLIT_PERSIST_MS) {
        reported = true;
        strike("split-screen", `${window.innerWidth}x${window.innerHeight} of ${window.screen.width}x${window.screen.height}`);
      }
    };
    const viewportTimer = window.setInterval(checkViewport, 500);
    window.addEventListener("resize", checkViewport);

    // AI helpers and other extensions inject their UI at the top of the page.
    // Already there when the exam starts: logged. Appearing during the exam
    // (e.g. a sidebar or "ask AI" popup being opened): a strike.
    const foreign = (n: Node): n is Element =>
      n instanceof Element &&
      n !== document.head &&
      n !== document.body &&
      !OWN_TAGS.has(n.tagName) &&
      !n.hasAttribute("data-app-root");
    const describe = (el: Element) => `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""}`.slice(0, 60);
    const present = [...document.documentElement.children, ...document.body.children].filter(foreign);
    if (present.length) notify("extension", `present: ${present.map(describe).join(", ")}`);
    const observer = new MutationObserver((records) => {
      for (const r of records) {
        for (const n of r.addedNodes) {
          if (foreign(n)) {
            strike("extension", `added: ${describe(n)}`);
            return;
          }
        }
      }
    });
    observer.observe(document.documentElement, { childList: true });
    observer.observe(document.body, { childList: true });

    // A second monitor makes a phone-free second screen easy (Chrome reports it).
    if ((window.screen as Screen & { isExtended?: boolean }).isExtended) notify("multi-screen");

    return () => {
      window.clearInterval(viewportTimer);
      window.removeEventListener("resize", checkViewport);
      observer.disconnect();
    };
  }, [active, notify, strike]);

  // Leave fullscreen once the exam stops being active (submitted / time up).
  useEffect(() => {
    if (!active && isFullscreen()) void document.exitFullscreen().catch(() => undefined);
  }, [active]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const onWatermarkTamper = useCallback(() => {
    setWatermarkKey((k) => k + 1); // remount a fresh overlay
    strike("watermark-tamper");
  }, [strike]);

  const dismissWarning = useCallback(() => {
    setWarning(null);
    if (propsRef.current.enforceFullscreen) void enterFullscreen();
  }, [enterFullscreen]);

  const ctx = useMemo<AntiCheatContextValue>(
    () => ({ strikes, maxWarnings, enterFullscreen }),
    [strikes, maxWarnings, enterFullscreen],
  );

  const remaining = Math.max(0, maxWarnings - strikes);
  const terminated = strikes >= maxWarnings;

  return (
    <AntiCheatContext.Provider value={ctx}>
      <div
        className={cn(active && "no-select", className)}
        onDragStart={(e) => active && e.preventDefault()}
        data-anticheat={active ? "on" : "off"}
      >
        {/* Hide everything from the print dialog while the exam is live. */}
        {active && <style>{`@media print{body{display:none!important}}`}</style>}

        {children}

        {active && watermarkLines && watermarkLines.length > 0 && (
          <Watermark key={watermarkKey} lines={watermarkLines} onTamper={onWatermarkTamper} />
        )}
      </div>

      {/* Transient toast for blocked actions */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            role="status"
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="fixed left-1/2 top-20 z-[90] -translate-x-1/2"
          >
            <div className="glass flex items-center gap-2 rounded-full px-4 py-2 text-sm text-ink shadow-glow-danger">
              <ShieldAlert className="h-4 w-4 text-state-danger" strokeWidth={1.5} />
              <span lang="bn">{toast.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Strike modal */}
      <AnimatePresence>
        {warning && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-obsidian-950/80 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="ac-title"
              aria-describedby="ac-desc"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-state-danger/40 bg-obsidian-800 p-6 text-center shadow-glow-danger"
            >
              <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(closest-side,rgba(244,63,94,0.35),transparent)]" />
              <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-state-danger/15 ring-1 ring-state-danger/40">
                <span className="absolute inset-0 rounded-2xl bg-state-danger/30 animate-pulse-ring" />
                {terminated ? (
                  <ShieldX className="relative h-8 w-8 text-state-danger" strokeWidth={1.5} />
                ) : (
                  <ShieldAlert className="relative h-8 w-8 text-state-danger" strokeWidth={1.5} />
                )}
              </div>

              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-state-danger">
                Warning {strikes}/{maxWarnings}
              </p>
              <h2 id="ac-title" lang="bn" className="mb-2 text-2xl font-bold text-ink">
                {terminated ? "পরীক্ষা স্বয়ংক্রিয়ভাবে জমা হচ্ছে" : `সতর্কতা ${toBn(strikes)}/${toBn(maxWarnings)}`}
              </h2>
              <p id="ac-desc" lang="bn" className="mb-5 text-sm text-ink-muted">
                {STRIKE_COPY[warning]}{" "}
                {terminated
                  ? "সর্বোচ্চ সতর্কতার সীমা পার হওয়ায় তোমার উত্তরগুলো জমা দেওয়া হয়েছে।"
                  : `আর ${toBn(remaining)} বার এমন হলে পরীক্ষা স্বয়ংক্রিয়ভাবে জমা হয়ে যাবে।`}
              </p>

              <div className="mb-6 flex justify-center gap-2" aria-hidden="true">
                {Array.from({ length: maxWarnings }, (_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 w-10 rounded-full transition-colors",
                      i < strikes ? "bg-state-danger shadow-glow-danger" : "bg-white/10",
                    )}
                  />
                ))}
              </div>

              {!terminated && (
                <button type="button" onClick={dismissWarning} className="btn-primary w-full" autoFocus>
                  <span lang="bn">বুঝেছি, পরীক্ষায় ফিরে যাই</span>
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AntiCheatContext.Provider>
  );
}
