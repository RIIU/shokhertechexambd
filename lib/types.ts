export type Level = "ssc" | "hsc";
export type StreamId = "science" | "arts" | "commerce";
export type ExamType = "practice" | "model" | "live" | "archive";
export type OptionId = "a" | "b" | "c" | "d";
export type Accent = "brand" | "indigo" | "cyan" | "amber" | "rose" | "violet";

export type SubjectIconKey =
  | "atom"
  | "flask"
  | "dna"
  | "sigma"
  | "calculator"
  | "microscope"
  | "cpu"
  | "book"
  | "languages"
  | "globe"
  | "landmark"
  | "scale"
  | "trending"
  | "briefcase"
  | "receipt"
  | "banknote"
  | "brain"
  | "users"
  | "factory"
  | "moon";

export interface Subject {
  id: string;
  nameBn: string;
  nameEn: string;
  /** Board subject code (NCTB / education board). */
  code: string;
  icon: SubjectIconKey;
  accent: Accent;
  chapters: number;
  compulsory?: boolean;
  /** Number of published exams per exam type. */
  exams: Record<ExamType, number>;
  /** Exam ids that are open right now, keyed by type. */
  featuredExamIds?: Partial<Record<ExamType, string>>;
}

export interface Stream {
  id: StreamId;
  nameBn: string;
  nameEn: string;
  taglineBn: string;
  accent: Accent;
}

export interface QuestionOption {
  id: OptionId;
  text: string;
}

/** A question as stored server-side, including the answer key. */
export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  correctOptionId: OptionId;
  explanation: string;
  topic: string;
  marks: number;
}

/** What the candidate's browser receives: the answer key is stripped. */
export type CandidateQuestion = Omit<Question, "correctOptionId" | "explanation">;

export interface ExamMeta {
  id: string;
  titleBn: string;
  titleEn: string;
  level: Level;
  stream: StreamId;
  subjectId: string;
  type: ExamType;
  durationSec: number;
  /** Marks deducted per wrong answer (0 for no negative marking). */
  negativeMark: number;
  /** Maximum tab-switch / focus-loss strikes before forced submission. */
  maxWarnings: number;
}

export interface Exam extends ExamMeta {
  questions: Question[];
}

export interface CandidateExam extends ExamMeta {
  totalMarks: number;
  questions: CandidateQuestion[];
}

export type Answers = Record<string, OptionId | null>;

export type ViolationKind =
  | "tab-hidden"
  | "window-blur"
  | "fullscreen-exit"
  | "devtools-open"
  | "blocked-shortcut"
  | "context-menu"
  | "clipboard"
  | "watermark-tamper";

export interface ViolationEvent {
  kind: ViolationKind;
  /** Whether this event counts as a strike towards forced submission. */
  strike: boolean;
  detail?: string;
  at: number;
}

export type SubmitReason = "manual" | "time-up" | "max-warnings";

export interface SubmitPayload {
  answers: Answers;
  timeTakenSec: number;
  strikes: number;
  reason: SubmitReason;
}

export interface QuestionResult {
  id: string;
  text: string;
  options: QuestionOption[];
  topic: string;
  selectedOptionId: OptionId | null;
  correctOptionId: OptionId;
  explanation: string;
  status: "correct" | "wrong" | "skipped";
}

export interface ExamResult {
  examId: string;
  titleBn: string;
  score: number;
  totalMarks: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number;
  rank: number;
  participants: number;
  timeTakenSec: number;
  strikes: number;
  reason: SubmitReason;
  topics: { topic: string; correct: number; total: number }[];
  questions: QuestionResult[];
  submittedAt: number;
}
