import { BarChart3, Layers, ShieldCheck, UserPlus, type LucideIcon } from "lucide-react";

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: UserPlus, title: "অ্যাকাউন্ট খোলো", body: "শুধু ফোন নম্বর আর পাসওয়ার্ড। ৩০ সেকেন্ডে রেজিস্ট্রেশন, কোনো ভেরিফিকেশন ফি না।" },
  { icon: Layers, title: "পরীক্ষা বেছে নাও", body: "স্তর → বিভাগ → বিষয়। এসএসসি হোক বা এইচএসসি, অধ্যায়ভিত্তিক অনুশীলন থেকে মডেল টেস্ট সব এক জায়গায়।" },
  { icon: ShieldCheck, title: "পরীক্ষার হলে বসাও", body: "ফুলস্ক্রিন মোড, সার্ভার-সাইড টাইমার আর কড়া অ্যান্টি-চিট। ট্যাব সুইচ করলে স্ট্রাইক, ৩টিতে পেপার জমা।" },
  { icon: BarChart3, title: "সাথে সাথে বিশ্লেষণ", body: "কটা ঠিক কটা ভুল, টপিকভিত্তিক দুর্বলতা আর সারা দেশের মধ্যে তোমার র‍্যাংক — জমা দেওয়ার সঙ্গে সঙ্গেই।" },
];

export function HowItWorks() {
  return (
    <section className="bg-section py-24" aria-labelledby="how-title">
      <div className="container">
        <div className="mb-12 max-w-2xl">
          <span className="chip mb-4">
            <span lang="bn">কীভাবে কাজ করে</span>
          </span>
          <h2 id="how-title" lang="bn" className="text-3xl font-bold text-ink sm:text-5xl">
            চার ধাপে <span className="text-gradient">প্রস্তুতি</span>
          </h2>
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="relative rounded-3xl border border-surface-border bg-obsidian-900 p-6 shadow-card">
              <span className="mb-5 flex items-center justify-between">
                <Icon className="h-8 w-8 text-brand-400" strokeWidth={1.5} />
                <span className="font-display text-3xl font-black text-white/5">{i + 1}</span>
              </span>
              <h3 lang="bn" className="mb-2 text-lg font-semibold text-ink">
                {title}
              </h3>
              <p lang="bn" className="text-sm leading-relaxed text-ink-muted">
                {body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
