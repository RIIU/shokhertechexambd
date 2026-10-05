/** Wording and numbers shared by the result page and the public share card. */

/** One-line verdict for a score band (percent of total marks). */
export function verdictFor(pct: number): { title: string; note: string } {
  if (pct >= 90) return { title: "অসাধারণ!", note: "প্রায় নিখুঁত পারফরম্যান্স। এই ধারা বজায় রাখো।" };
  if (pct >= 75) return { title: "দারুণ হয়েছে!", note: "খুব ভালো প্রস্তুতি। দুর্বল টপিকগুলো ঝালিয়ে নিলেই শীর্ষে।" };
  if (pct >= 50) return { title: "ভালো চেষ্টা", note: "ভিত্তি মজবুত। ভুলগুলোর ব্যাখ্যা পড়ে আরেকবার অনুশীলন করো।" };
  return { title: "আরও অনুশীলন দরকার", note: "হতাশ হয়ো না। নিচের ব্যাখ্যাগুলো পড়ে অধ্যায়ভিত্তিক অনুশীলন করো।" };
}

/** Share of the other participants this rank beats, 0–100. */
export function percentileOf(rank: number, participants: number): number {
  if (participants <= 1) return 100;
  return Math.round(((participants - rank) / (participants - 1)) * 100);
}
