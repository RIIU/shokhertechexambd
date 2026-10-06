import { Suspense } from "react";
import { Hero } from "@/components/landing/Hero";
import { PackagesSection } from "@/components/packages/PackagesSection";
import { LevelSwitcher } from "@/components/landing/LevelSwitcher";
import { Features } from "@/components/landing/Features";
import { LiveHighlights } from "@/components/live/LiveHighlights";

// Live exam counts come from the database on every visit.
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <main>
      <Hero />

      <Suspense fallback={null}>
        <LiveHighlights />
      </Suspense>

      <section className="container py-14 sm:py-16" aria-labelledby="level-title">
        <div className="mb-10 text-center">
          <h2 id="level-title" lang="bn" className="mb-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            তোমার <span className="text-gradient">পরীক্ষা সিস্টেম</span> বেছে নাও
          </h2>
          <p lang="bn" className="text-ink-muted">
            স্তর, তারপর বিভাগ। এরপর বিষয় আর পরীক্ষার ধরন।
          </p>
        </div>
        <LevelSwitcher />
      </section>

      <Features />

      <PackagesSection />
    </main>
  );
}
