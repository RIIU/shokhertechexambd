import type { OptionId } from "@/lib/types";

/**
 * Parses many MCQs pasted as plain text (used by the admin bulk import, in the
 * browser for the preview and again on the server before saving).
 *
 *   ১. নিচের কোনটি মৌলিক রাশি?
 *   ক) বল
 *   খ) বেগ
 *   গ) তড়িৎ প্রবাহ *
 *   ঘ) কাজ
 *   ব্যাখ্যা: SI পদ্ধতিতে মৌলিক রাশি সাতটি…
 *   টপিক: ভৌত রাশি
 *
 * Questions are separated by a blank line. The correct option is marked with
 * a trailing * (or a line "উত্তর: গ" / "Ans: c"). Options may be labelled
 * ক খ গ ঘ, a b c d or A B C D, followed by ) . : or -.
 */

export interface ParsedQuestion {
  text: string;
  options: Record<OptionId, string>;
  correctOptionId: OptionId;
  explanation: string;
  topic: string;
  marks: number;
}

export interface ParseResult {
  questions: ParsedQuestion[];
  errors: { block: number; message: string }[];
}

const LABELS: Record<string, OptionId> = { ক: "a", খ: "b", গ: "c", ঘ: "d", a: "a", b: "b", c: "c", d: "d" };
const OPTION_LINE = /^\(?([কখগঘa-dA-D])[).:\-]\s*(.+)$/;
const ANSWER_LINE = /^(?:উত্তর|সঠিক উত্তর|ans(?:wer)?)\s*[:：-]\s*\(?([কখগঘa-dA-D])\)?\s*$/i;
const EXPLAIN_LINE = /^(?:ব্যাখ্যা|explanation)\s*[:：-]\s*(.*)$/i;
const TOPIC_LINE = /^(?:টপিক|অধ্যায়|topic)\s*[:：-]\s*(.*)$/i;
const MARKS_LINE = /^(?:মান|নম্বর|marks?)\s*[:：-]\s*([০-৯\d.]+)\s*$/i;
const NUMBER_PREFIX = /^(?:প্রশ্ন\s*)?[০-৯\d]+\s*[.)।:-]\s*/;

const toAscii = (s: string) => s.replace(/[০-৯]/g, (c) => String("০১২৩৪৫৬৭৮৯".indexOf(c)));

export function parseQuestions(raw: string, defaults: { topic?: string } = {}): ParseResult {
  const blocks = raw
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((b) => b.split("\n").map((l) => l.trim()).filter(Boolean))
    .filter((b) => b.length);

  const questions: ParsedQuestion[] = [];
  const errors: ParseResult["errors"] = [];

  blocks.forEach((lines, i) => {
    const block = i + 1;
    const textLines: string[] = [];
    const options: Partial<Record<OptionId, string>> = {};
    let correct: OptionId | undefined;
    let explanation = "";
    let topic = defaults.topic ?? "";
    let marks = 1;
    let section: "text" | "options" | "explanation" = "text";

    for (const line of lines) {
      const opt = OPTION_LINE.exec(line);
      const ans = ANSWER_LINE.exec(line);
      const exp = EXPLAIN_LINE.exec(line);
      const top = TOPIC_LINE.exec(line);
      const mk = MARKS_LINE.exec(line);
      if (ans) {
        correct = LABELS[ans[1]!.toLowerCase()] ?? LABELS[ans[1]!];
      } else if (exp) {
        explanation = exp[1]!.trim();
        section = "explanation";
      } else if (top) {
        topic = top[1]!.trim();
      } else if (mk) {
        marks = Number(toAscii(mk[1]!)) || 1;
      } else if (opt && section !== "explanation") {
        const id = LABELS[opt[1]!.toLowerCase()] ?? LABELS[opt[1]!];
        let text = opt[2]!.trim();
        if (/\s*\*+$/.test(text)) {
          text = text.replace(/\s*\*+$/, "");
          correct = id;
        }
        if (id) options[id] = text;
        section = "options";
      } else if (section === "explanation") {
        explanation += ` ${line}`;
      } else if (section === "text") {
        textLines.push(textLines.length ? line : line.replace(NUMBER_PREFIX, ""));
      } else {
        errors.push({ block, message: `বোঝা যায়নি: "${line.slice(0, 40)}"` });
      }
    }

    const text = textLines.join(" ").trim();
    const missing = (["a", "b", "c", "d"] as const).filter((k) => !options[k]);
    if (!text) return void errors.push({ block, message: "প্রশ্নের লেখা নেই" });
    if (missing.length) return void errors.push({ block, message: `অপশন নেই: ${missing.map((k) => "কখগঘ"["abcd".indexOf(k)]).join(", ")}` });
    if (!correct) return void errors.push({ block, message: "সঠিক উত্তর চিহ্নিত করা হয়নি (অপশনের শেষে * দাও)" });
    if (marks <= 0 || marks > 10) return void errors.push({ block, message: "মান ০ থেকে ১০ এর মধ্যে হতে হবে" });

    questions.push({ text, options: options as Record<OptionId, string>, correctOptionId: correct, explanation: explanation.trim(), topic: topic || "সাধারণ", marks });
  });

  return { questions, errors };
}
