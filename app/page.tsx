import { Hero } from "@/components/landing/Hero";
import { LevelSwitcher } from "@/components/landing/LevelSwitcher";
import { Features } from "@/components/landing/Features";

export default function HomePage() {
  return (
    <main>
      <Hero />

      <section className="container py-16" aria-labelledby="level-title">
        <div className="mb-10 text-center">
          <h2 id="level-title" lang="bn" className="mb-3 text-3xl font-bold text-ink sm:text-5xl">
            তোমার <span className="text-gradient">পরীক্ষা সিস্টেম</span> বেছে নাও
          </h2>
          <p lang="bn" className="text-ink-muted">
            স্তর, তারপর বিভাগ। এরপর বিষয় আর পরীক্ষার ধরন।
          </p>
        </div>
        <LevelSwitcher />
      </section>

      <Features />
    </main>
  );
}
