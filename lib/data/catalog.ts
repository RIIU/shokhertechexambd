import type { ExamType, Level, Stream, StreamId, Subject, SubjectIconKey, Accent } from "@/lib/types";

/**
 * Seed catalog of levels, streams and subjects (NCTB board subject codes).
 * In production this comes from the CMS / admin panel; the shape is the same.
 */

export const LEVELS: Record<Level, { nameBn: string; nameEn: string; fullBn: string; accent: Accent }> = {
  ssc: {
    nameBn: "এসএসসি",
    nameEn: "SSC",
    fullBn: "মাধ্যমিক স্কুল সার্টিফিকেট",
    accent: "brand",
  },
  hsc: {
    nameBn: "এইচএসসি",
    nameEn: "HSC",
    fullBn: "উচ্চ মাধ্যমিক সার্টিফিকেট",
    accent: "leaf",
  },
};

export const STREAMS: Record<StreamId, Stream> = {
  science: {
    id: "science",
    nameBn: "বিজ্ঞান",
    nameEn: "Science",
    taglineBn: "পদার্থ, রসায়ন, জীববিজ্ঞান ও উচ্চতর গণিতের অধ্যায়ভিত্তিক প্রস্তুতি",
    accent: "brand",
  },
  arts: {
    id: "arts",
    nameBn: "মানবিক",
    nameEn: "Arts",
    taglineBn: "ইতিহাস, ভূগোল, পৌরনীতি ও অর্থনীতির পূর্ণাঙ্গ মডেল টেস্ট",
    accent: "violet",
  },
  commerce: {
    id: "commerce",
    nameBn: "ব্যবসায় শিক্ষা",
    nameEn: "Commerce",
    taglineBn: "হিসাববিজ্ঞান, ফিন্যান্স ও ব্যবসায় উদ্যোগের লাইভ পরীক্ষা",
    accent: "amber",
  },
};

export const STREAM_IDS = Object.keys(STREAMS) as StreamId[];
export const EXAM_TYPES: ExamType[] = ["practice", "model", "live", "archive"];

export const EXAM_TYPE_META: Record<ExamType, { nameBn: string; nameEn: string; descBn: string }> = {
  practice: { nameBn: "অধ্যায়ভিত্তিক অনুশীলন", nameEn: "Chapter Practice", descBn: "নিজের গতিতে প্রতিটি অধ্যায় ঝালাই" },
  model: { nameBn: "মডেল টেস্ট", nameEn: "Model Test", descBn: "বোর্ড প্রশ্নের পূর্ণাঙ্গ সিমুলেশন" },
  live: { nameBn: "লাইভ পরীক্ষা", nameEn: "Live Exam", descBn: "সারা দেশের সাথে রিয়েল-টাইম র‍্যাংক" },
  archive: { nameBn: "আর্কাইভ", nameEn: "Archive", descBn: "আগের সব লাইভ পরীক্ষা আবার দাও" },
};

type SubjectSeed = [id: string, nameBn: string, nameEn: string, code: string, icon: SubjectIconKey, accent: Accent, chapters: number];

function build(level: Level, seeds: SubjectSeed[], compulsory: string[] = []): Subject[] {
  return seeds.map(([id, nameBn, nameEn, code, icon, accent, chapters]) => ({
    id,
    nameBn,
    nameEn,
    code,
    icon,
    accent,
    chapters,
    compulsory: compulsory.includes(id),
  }));
}

/** Papers shared across all three streams at a level. */
const SSC_COMMON: SubjectSeed[] = [
  ["bangla-1", "বাংলা ১ম পত্র", "Bangla 1st Paper", "101", "book", "rose", 18],
  ["bangla-2", "বাংলা ২য় পত্র", "Bangla 2nd Paper", "102", "book", "rose", 12],
  ["english-1", "ইংরেজি ১ম পত্র", "English 1st Paper", "107", "languages", "teal", 14],
  ["english-2", "ইংরেজি ২য় পত্র", "English 2nd Paper", "108", "languages", "teal", 12],
  ["math", "গণিত", "Mathematics", "109", "calculator", "leaf", 17],
  ["ict", "তথ্য ও যোগাযোগ প্রযুক্তি", "ICT", "154", "cpu", "brand", 6],
];

const HSC_COMMON: SubjectSeed[] = [
  ["bangla-1", "বাংলা ১ম পত্র", "Bangla 1st Paper", "101", "book", "rose", 20],
  ["bangla-2", "বাংলা ২য় পত্র", "Bangla 2nd Paper", "102", "book", "rose", 12],
  ["english-1", "ইংরেজি ১ম পত্র", "English 1st Paper", "107", "languages", "teal", 12],
  ["english-2", "ইংরেজি ২য় পত্র", "English 2nd Paper", "108", "languages", "teal", 12],
  ["ict", "তথ্য ও যোগাযোগ প্রযুক্তি", "ICT", "275", "cpu", "brand", 6],
];

const COMMON_IDS = ["bangla-1", "bangla-2", "english-1", "english-2", "math", "ict"];

const SUBJECTS: Record<Level, Record<StreamId, Subject[]>> = {
  ssc: {
    science: build(
      "ssc",
      [
        ["physics", "পদার্থবিজ্ঞান", "Physics", "136", "atom", "brand", 14],
        ["chemistry", "রসায়ন", "Chemistry", "137", "flask", "teal", 12],
        ["higher-math", "উচ্চতর গণিত", "Higher Mathematics", "126", "sigma", "leaf", 14],
        ["biology", "জীববিজ্ঞান", "Biology", "138", "dna", "violet", 14],
        ...SSC_COMMON,
        ["bgs", "বাংলাদেশ ও বিশ্বপরিচয়", "Bangladesh & Global Studies", "150", "globe", "amber", 14],
      ],
      COMMON_IDS,
    ),
    arts: build(
      "ssc",
      [
        ["history", "বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা", "History of Bangladesh & World Civilization", "153", "landmark", "amber", 11],
        ["geography", "ভূগোল ও পরিবেশ", "Geography & Environment", "110", "globe", "teal", 11],
        ["civics", "পৌরনীতি ও নাগরিকতা", "Civics & Citizenship", "140", "scale", "violet", 11],
        ["economics", "অর্থনীতি", "Economics", "141", "trending", "brand", 10],
        ["general-science", "সাধারণ বিজ্ঞান", "General Science", "127", "microscope", "leaf", 14],
        ...SSC_COMMON,
      ],
      COMMON_IDS,
    ),
    commerce: build(
      "ssc",
      [
        ["accounting", "হিসাববিজ্ঞান", "Accounting", "146", "receipt", "amber", 12],
        ["finance", "ফিন্যান্স ও ব্যাংকিং", "Finance & Banking", "152", "banknote", "brand", 13],
        ["entrepreneurship", "ব্যবসায় উদ্যোগ", "Business Entrepreneurship", "143", "briefcase", "violet", 12],
        ["general-science", "সাধারণ বিজ্ঞান", "General Science", "127", "microscope", "leaf", 14],
        ...SSC_COMMON,
      ],
      COMMON_IDS,
    ),
  },
  hsc: {
    science: build(
      "hsc",
      [
        ["physics-1", "পদার্থবিজ্ঞান ১ম পত্র", "Physics 1st Paper", "174", "atom", "brand", 10],
        ["physics-2", "পদার্থবিজ্ঞান ২য় পত্র", "Physics 2nd Paper", "175", "atom", "brand", 11],
        ["chemistry-1", "রসায়ন ১ম পত্র", "Chemistry 1st Paper", "176", "flask", "teal", 5],
        ["chemistry-2", "রসায়ন ২য় পত্র", "Chemistry 2nd Paper", "177", "flask", "teal", 5],
        ["higher-math-1", "উচ্চতর গণিত ১ম পত্র", "Higher Math 1st Paper", "265", "sigma", "leaf", 10],
        ["higher-math-2", "উচ্চতর গণিত ২য় পত্র", "Higher Math 2nd Paper", "266", "sigma", "leaf", 9],
        ["biology-1", "জীববিজ্ঞান ১ম পত্র", "Biology 1st Paper", "178", "dna", "violet", 12],
        ["biology-2", "জীববিজ্ঞান ২য় পত্র", "Biology 2nd Paper", "179", "dna", "violet", 12],
        ...HSC_COMMON,
      ],
      COMMON_IDS,
    ),
    arts: build(
      "hsc",
      [
        ["history", "ইতিহাস", "History", "304", "landmark", "amber", 10],
        ["islamic-history", "ইসলামের ইতিহাস ও সংস্কৃতি", "Islamic History & Culture", "267", "moon", "brand", 10],
        ["civics", "পৌরনীতি ও সুশাসন", "Civics & Good Governance", "269", "scale", "violet", 10],
        ["economics", "অর্থনীতি", "Economics", "109", "trending", "teal", 10],
        ["logic", "যুক্তিবিদ্যা", "Logic", "121", "brain", "leaf", 10],
        ["sociology", "সমাজবিজ্ঞান", "Sociology", "117", "users", "rose", 10],
        ...HSC_COMMON,
      ],
      COMMON_IDS,
    ),
    commerce: build(
      "hsc",
      [
        ["accounting-1", "হিসাববিজ্ঞান ১ম পত্র", "Accounting 1st Paper", "253", "receipt", "amber", 10],
        ["accounting-2", "হিসাববিজ্ঞান ২য় পত্র", "Accounting 2nd Paper", "254", "receipt", "amber", 9],
        ["management", "ব্যবসায় সংগঠন ও ব্যবস্থাপনা", "Business Organisation & Management", "277", "briefcase", "violet", 10],
        ["finance", "ফিন্যান্স, ব্যাংকিং ও বীমা", "Finance, Banking & Insurance", "292", "banknote", "brand", 10],
        ["marketing", "উৎপাদন ব্যবস্থাপনা ও বিপণন", "Production Management & Marketing", "286", "factory", "teal", 10],
        ...HSC_COMMON,
      ],
      COMMON_IDS,
    ),
  },
};

/** Static subject list. Exams are attached from the database (see StreamSubjectsView). */
export function getSubjects(level: Level, stream: StreamId): Subject[] {
  return SUBJECTS[level][stream];
}

export function isLevel(value: string): value is Level {
  return value === "ssc" || value === "hsc";
}

export function isStream(value: string): value is StreamId {
  return value in STREAMS;
}
