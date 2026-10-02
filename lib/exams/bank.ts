import type { Exam, Question } from "@/lib/types";

/**
 * Seed question bank. SERVER-ONLY: this module contains answer keys and must
 * never be imported from a "use client" file. Candidates receive a stripped
 * copy via `toCandidateExam()` in ./repository.ts.
 */

const PHYSICS_CH1: Question[] = [
  {
    id: "phy-q1",
    topic: "ভৌত রাশি ও পরিমাপ",
    marks: 1,
    text: "নিচের কোনটি মৌলিক রাশি?",
    options: [
      { id: "a", text: "বল" },
      { id: "b", text: "বেগ" },
      { id: "c", text: "তড়িৎ প্রবাহ" },
      { id: "d", text: "কাজ" },
    ],
    correctOptionId: "c",
    explanation:
      "SI পদ্ধতিতে মৌলিক রাশি সাতটি: দৈর্ঘ্য, ভর, সময়, তাপমাত্রা, তড়িৎ প্রবাহ, দীপন তীব্রতা ও পদার্থের পরিমাণ। বল, বেগ ও কাজ এগুলো থেকে গঠিত লব্ধ রাশি।",
  },
  {
    id: "phy-q2",
    topic: "ভৌত রাশি ও পরিমাপ",
    marks: 1,
    text: "দীপন তীব্রতার SI একক কোনটি?",
    options: [
      { id: "a", text: "ক্যান্ডেলা" },
      { id: "b", text: "কেলভিন" },
      { id: "c", text: "মোল" },
      { id: "d", text: "লুমেন" },
    ],
    correctOptionId: "a",
    explanation: "দীপন তীব্রতার SI একক ক্যান্ডেলা (cd)। কেলভিন তাপমাত্রার, মোল পদার্থের পরিমাণের একক; লুমেন আলোক প্রবাহের লব্ধ একক।",
  },
  {
    id: "phy-q3",
    topic: "ভৌত রাশি ও পরিমাপ",
    marks: 1,
    text: "১ মাইক্রোমিটার (μm) সমান কত মিটার?",
    options: [
      { id: "a", text: "১০⁻³ m" },
      { id: "b", text: "১০⁻⁶ m" },
      { id: "c", text: "১০⁻⁹ m" },
      { id: "d", text: "১০⁻¹² m" },
    ],
    correctOptionId: "b",
    explanation: "মাইক্রো (μ) উপসর্গের মান ১০⁻⁶। তাই ১ μm = ১০⁻⁶ m। মিলি = ১০⁻³, ন্যানো = ১০⁻⁹, পিকো = ১০⁻¹²।",
  },
  {
    id: "phy-q4",
    topic: "ভৌত রাশি ও পরিমাপ",
    marks: 1,
    text: "স্লাইড ক্যালিপার্সের প্রধান স্কেলের ক্ষুদ্রতম এক ঘরের মান s এবং ভার্নিয়ার স্কেলের ঘর সংখ্যা n হলে ভার্নিয়ার ধ্রুবক কত?",
    options: [
      { id: "a", text: "s × n" },
      { id: "b", text: "n / s" },
      { id: "c", text: "s / n" },
      { id: "d", text: "s + n" },
    ],
    correctOptionId: "c",
    explanation: "ভার্নিয়ার ধ্রুবক VC = s / n। যেমন s = ১ mm ও n = ১০ হলে VC = ০.১ mm।",
  },
  {
    id: "phy-q5",
    topic: "ভৌত রাশি ও পরিমাপ",
    marks: 1,
    text: "স্ক্রু গজে স্ক্রুর ঘূর্ণনের দিক পরিবর্তন করলে যে ত্রুটি দেখা দেয় তাকে কী বলে?",
    options: [
      { id: "a", text: "শূন্য ত্রুটি" },
      { id: "b", text: "পিছট ত্রুটি" },
      { id: "c", text: "লম্বন ত্রুটি" },
      { id: "d", text: "এলোমেলো ত্রুটি" },
    ],
    correctOptionId: "b",
    explanation:
      "দীর্ঘ ব্যবহারে স্ক্রুর প্যাঁচ ক্ষয় হলে ঘূর্ণনের দিক বদলানোর সময় কিছুক্ষণ টুপি ঘুরলেও স্ক্রু সরে না। এটাই পিছট ত্রুটি (backlash error)। একই দিকে ঘুরিয়ে পাঠ নিলে এ ত্রুটি এড়ানো যায়।",
  },
  {
    id: "phy-q6",
    topic: "ভৌত রাশি ও পরিমাপ",
    marks: 1,
    text: "নিচের কোনটি ভেক্টর রাশি?",
    options: [
      { id: "a", text: "দ্রুতি" },
      { id: "b", text: "দূরত্ব" },
      { id: "c", text: "সরণ" },
      { id: "d", text: "ভর" },
    ],
    correctOptionId: "c",
    explanation: "সরণের মান ও দিক দুটোই আছে, তাই এটি ভেক্টর রাশি। দ্রুতি, দূরত্ব ও ভরের শুধু মান আছে, এরা স্কেলার।",
  },
];

const PHYSICS_CH2: Question[] = [
  {
    id: "phy-q7",
    topic: "গতি",
    marks: 1,
    text: "স্থির অবস্থান থেকে একটি বস্তু ২ m/s² সুষম ত্বরণে চলতে শুরু করল। ৫ সেকেন্ড পর এর বেগ কত হবে?",
    options: [
      { id: "a", text: "২.৫ m/s" },
      { id: "b", text: "৭ m/s" },
      { id: "c", text: "১০ m/s" },
      { id: "d", text: "২৫ m/s" },
    ],
    correctOptionId: "c",
    explanation: "v = u + at = ০ + ২ × ৫ = ১০ m/s।",
  },
  {
    id: "phy-q8",
    topic: "গতি",
    marks: 1,
    text: "স্থির অবস্থান থেকে ২ m/s² সুষম ত্বরণে চলা একটি বস্তু প্রথম ৫ সেকেন্ডে কত দূরত্ব অতিক্রম করবে?",
    options: [
      { id: "a", text: "১০ m" },
      { id: "b", text: "২৫ m" },
      { id: "c", text: "৫০ m" },
      { id: "d", text: "১২.৫ m" },
    ],
    correctOptionId: "b",
    explanation: "s = ut + ½at² = ০ + ½ × ২ × ৫² = ২৫ m।",
  },
  {
    id: "phy-q9",
    topic: "গতি",
    marks: 1,
    text: "৭২ km/h বেগকে m/s এককে প্রকাশ করলে কত হয়?",
    options: [
      { id: "a", text: "১০ m/s" },
      { id: "b", text: "২০ m/s" },
      { id: "c", text: "৩৬ m/s" },
      { id: "d", text: "২৫৯.২ m/s" },
    ],
    correctOptionId: "b",
    explanation: "১ km/h = ১০০০/৩৬০০ m/s = ৫/১৮ m/s। তাই ৭২ × ৫/১৮ = ২০ m/s।",
  },
  {
    id: "phy-q10",
    topic: "গতি",
    marks: 1,
    text: "বেগ-সময় লেখচিত্রের ঢাল কোন রাশি নির্দেশ করে?",
    options: [
      { id: "a", text: "সরণ" },
      { id: "b", text: "দ্রুতি" },
      { id: "c", text: "ত্বরণ" },
      { id: "d", text: "বল" },
    ],
    correctOptionId: "c",
    explanation: "ঢাল = বেগের পরিবর্তন ÷ সময় = ত্বরণ। আর লেখের নিচের ক্ষেত্রফল সরণ নির্দেশ করে।",
  },
  {
    id: "phy-q11",
    topic: "গতি",
    marks: 1,
    text: "২০ m/s বেগে চলমান একটি গাড়ি ব্রেক কষার ৪ সেকেন্ড পর থেমে গেল। গাড়িটির মন্দন কত?",
    options: [
      { id: "a", text: "৪ m/s²" },
      { id: "b", text: "৫ m/s²" },
      { id: "c", text: "৮০ m/s²" },
      { id: "d", text: "১৬ m/s²" },
    ],
    correctOptionId: "b",
    explanation: "a = (v − u) / t = (০ − ২০) / ৪ = −৫ m/s²। ঋণাত্মক ত্বরণই মন্দন, তাই মন্দন ৫ m/s²।",
  },
  {
    id: "phy-q12",
    topic: "গতি",
    marks: 1,
    text: "ভূপৃষ্ঠের কাছে মুক্তভাবে পড়ন্ত বস্তুর ত্বরণের আদর্শ মান প্রায় কত?",
    options: [
      { id: "a", text: "৯.৮ m/s²" },
      { id: "b", text: "৬.৬৭ m/s²" },
      { id: "c", text: "১.৬ m/s²" },
      { id: "d", text: "৯৮ m/s²" },
    ],
    correctOptionId: "a",
    explanation: "অভিকর্ষজ ত্বরণ g ≈ ৯.৮ m/s²। চাঁদে এর মান প্রায় ১.৬ m/s²।",
  },
];

export const EXAM_BANK: Record<string, Exam> = {
  "ssc-physics-live-01": {
    id: "ssc-physics-live-01",
    titleBn: "পদার্থবিজ্ঞান লাইভ পরীক্ষা: অধ্যায় ১–২",
    titleEn: "Physics Live Exam: Chapters 1–2",
    level: "ssc",
    stream: "science",
    subjectId: "physics",
    type: "live",
    durationSec: 15 * 60,
    negativeMark: 0.25,
    maxWarnings: 3,
    questions: [...PHYSICS_CH1, ...PHYSICS_CH2],
  },
  "ssc-physics-practice-ch1": {
    id: "ssc-physics-practice-ch1",
    titleBn: "অধ্যায় ১: ভৌত রাশি ও পরিমাপ",
    titleEn: "Chapter 1 Practice: Physical Quantities & Measurement",
    level: "ssc",
    stream: "science",
    subjectId: "physics",
    type: "practice",
    durationSec: 8 * 60,
    negativeMark: 0,
    maxWarnings: 3,
    questions: PHYSICS_CH1,
  },
};
