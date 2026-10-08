import { Hero } from "@/components/landing/Hero";
import { StatsStrip } from "@/components/landing/StatsStrip";
import { LevelSwitcher } from "@/components/landing/LevelSwitcher";
import { Features } from "@/components/landing/Features";
import { LiveExamTicker } from "@/components/landing/LiveExamTicker";
import { TopLearners } from "@/components/landing/TopLearners";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { FaqSection } from "@/components/landing/FaqSection";
import { landingData } from "@/lib/server/landing";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { stats, exams, leaderboard } = await landingData();

  return (
    <main>
      <Hero />
      <StatsStrip stats={stats} />

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
      <LiveExamTicker exams={exams} />
      <TopLearners learners={leaderboard} />
      <HowItWorks />
      <Testimonials />
      <FaqSection />
    </main>
  );
}
