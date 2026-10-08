import { Plus } from "lucide-react";

const FAQS: { q: string; a: string }[] = [
  {
    q: "পরীক্ষা দিতে কত খরচ?",
    a: "এই মুহূর্তে প্রকাশিত সব পরীক্ষাই সম্পূর্ণ ফ্রি। শুধু অ্যাকাউন্ট খুলে বসে পড়ো। ভবিষ্যতে পেইড পরীক্ষা এলে সেটি স্পষ্টভাবে দামসহ দেখানো হবে।",
  },
  {
    q: "অ্যান্টি-চিট আসলে কী করে?",
    a: "পরীক্ষা ফুলস্ক্রিনে চলে। ট্যাব সুইচ, ফুলস্ক্রিন ত্যাগ, কপি-পেস্ট ও ডেভটুলস ব্লক করা থাকে, আর স্ক্রিনজুড়ে তোমার ফোন নম্বরের ওয়াটারমার্ক। ৩টি স্ট্রাইক হলে পেপার নিজে থেকেই জমা হয়ে যায়।",
  },
  {
    q: "জমা দেওয়ার পর উত্তরমালার খাতা দেখা যাবে?",
    a: "হ্যাঁ — যেসব পরীক্ষায় প্রশ্নোত্তর প্রকাশ চালু থাকে, সেগুলোতে প্রতিটি প্রশ্নের ঠিক/ভুল, সঠিক উত্তর ও ধাপে ধাপে ব্যাখ্যা সাথে সাথেই দেখা যায়। কয়েকটি পরীক্ষায় এটি বন্ধ রাখা হয়, সেক্ষেত্রে শুধু স্কোর ও র‍্যাংক দেখা যায়।",
  },
  {
    q: "মোবাইল থেকেও দেওয়া যাবে?",
    a: "যাবে। পুরো পরীক্ষা ইন্টারফেস মোবাইলের জন্য সাজানো — টাইমার, প্রশ্নের ন্যাভিগেটর আর স্ট্রাইক কাউন্টার ছোট স্ক্রিনেও সবসময় দেখা থাকে।",
  },
  {
    q: "সময় শেষ হয়ে গেলে কী হয়?",
    a: "টাইমার সার্ভারে চলে, ব্রাউজারে নয়। সময় শেষ হওয়া মাত্র উত্তরগুলো জমা হয়ে যায় এবং যা উত্তর দিয়েছিলে সেটাই গ্রেড হয়।",
  },
  {
    q: "একই পরীক্ষা বারবার দেওয়া যাবে?",
    a: "লাইভ পরীক্ষায় একজন শিক্ষার্থী একবারই জমা দিতে পারে — র‍্যাংক তাই সবার জন্য তুলনীয়। অধ্যায়ভিত্তিক অনুশীলন ও মডেল টেস্ট যত খুশি বার দিতে পারো, প্রতিবারই নতুন করে স্কোর হবে।",
  },
];

export function FaqSection() {
  return (
    <section className="container py-24" aria-labelledby="faq-title">
      <div className="mb-10 max-w-2xl">
        <span className="chip mb-4">
          <span lang="bn">সাধারণ জিজ্ঞাসা</span>
        </span>
        <h2 id="faq-title" lang="bn" className="text-3xl font-bold text-ink sm:text-5xl">
          যা <span className="text-gradient">জানতে চাও</span>
        </h2>
      </div>

      <ul className="mx-auto max-w-3xl divide-y divide-surface-border rounded-3xl border border-surface-border bg-obsidian-900 shadow-card">
        {FAQS.map(({ q, a }) => (
          <li key={q}>
            <details className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink marker:hidden">
                <span lang="bn">{q}</span>
                <Plus className="h-5 w-5 shrink-0 text-brand-400 transition-transform group-open:rotate-45" strokeWidth={1.5} />
              </summary>
              <p lang="bn" className="mt-3 text-sm leading-relaxed text-ink-muted">
                {a}
              </p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
