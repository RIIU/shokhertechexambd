"use client";

import { useEffect } from "react";
import Link from "next/link";

/** Shown instead of Next's bare "Application error" when a page fails to render. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="mb-2 font-display text-5xl font-black text-gradient">উফ!</p>
      <p lang="bn" className="mb-2 text-lg text-ink">
        পাতাটি লোড করতে সমস্যা হয়েছে।
      </p>
      <p lang="bn" className="mb-6 max-w-md text-sm text-ink-muted">
        একটু পরে আবার চেষ্টা করো। সমস্যা থেকে গেলে অ্যাডমিনকে জানাও।
        {error.digest && <span className="mt-1 block font-mono text-xs text-ink-subtle">Error ID: {error.digest}</span>}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          <span lang="bn">আবার চেষ্টা করো</span>
        </button>
        <Link href="/" className="btn-ghost">
          <span lang="bn">হোমে ফিরে যাও</span>
        </Link>
      </div>
    </main>
  );
}
