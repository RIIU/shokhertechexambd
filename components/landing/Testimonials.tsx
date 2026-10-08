import { Quote } from "lucide-react";
import { LEVELS } from "@/lib/data/catalog";
import { TESTIMONIALS } from "@/lib/data/testimonials";

export function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section className="bg-section py-24" aria-labelledby="voices-title">
      <div className="container">
        <div className="mb-12 max-w-2xl">
          <span className="chip mb-4">
            <Quote className="h-3.5 w-3.5 text-brand-400" strokeWidth={1.5} />
            <span lang="bn">শিক্ষার্থীদের কথা</span>
          </span>
          <h2 id="voices-title" lang="bn" className="text-3xl font-bold text-ink sm:text-5xl">
            যারা <span className="text-gradient">দিয়েছে</span>, তারা বলছে
          </h2>
        </div>

        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <li key={t.name} className="rounded-3xl border border-surface-border bg-obsidian-900 p-6 shadow-card">
              <p lang="bn" className="mb-5 leading-relaxed text-ink">
                “{t.quote}”
              </p>
              <footer className="flex items-center gap-2 text-sm">
                <span lang="bn" className="font-semibold text-brand-300">
                  {t.name}
                </span>
                <span lang="bn" className="text-ink-subtle">
                  {LEVELS[t.level].nameBn}
                  {t.detail ? ` · ${t.detail}` : ""}
                </span>
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
