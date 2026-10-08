import type { Attempt, ExamMeta, ExamStatus, ExamType, Level, Question, StoredExam, StoredViolation, StreamId, User } from "@/lib/types";

/** An exam without its questions — what public listing pages need. */
export interface ExamCard {
  id: string;
  titleBn: string;
  level: Level;
  stream: StreamId;
  subjectId: string;
  type: ExamType;
  durationSec: number;
  questionCount: number;
  totalMarks: number;
  isPaid: boolean;
  price: number;
  createdAt: number;
}

/** A submitted score without the answers/result payload, for public listings. */
export interface ScoreRow {
  userId: string;
  examId: string;
  score: number;
  submittedAt: number;
}

/**
 * Everything the app needs from persistence. Two drivers implement it:
 *  - supabase.ts: Supabase Postgres (production)
 *  - json.ts:     a local JSON file (zero-setup development)
 * Business rules live in lib/server/{users,exams,attempts,stats}.ts, not here.
 */
export interface Store {
  readonly kind: "supabase" | "json";

  // users
  findUserByPhone(phone: string): Promise<User | undefined>;
  getUser(id: string): Promise<User | undefined>;
  getUsers(ids: string[]): Promise<User[]>;
  insertUser(user: User): Promise<"ok" | "phone-taken">;
  listUsers(): Promise<User[]>;
  updateUser(id: string, patch: Partial<User>): Promise<void>;
  setUserBlocked(id: string, blocked: boolean): Promise<void>;
  hasAdmin(): Promise<boolean>;
  /** Students who are not blocked. Cheap enough for a public counter. */
  countStudents(): Promise<number>;

  // exams & questions
  getExam(id: string): Promise<StoredExam | undefined>;
  listExams(filter?: { level?: Level; stream?: StreamId; status?: ExamStatus }): Promise<StoredExam[]>;
  /** Like listExams but without question bodies, for listing pages. */
  listExamCards(filter?: { level?: Level; stream?: StreamId; status?: ExamStatus; type?: ExamType }): Promise<ExamCard[]>;
  insertExam(exam: StoredExam): Promise<void>;
  updateExam(id: string, patch: Partial<ExamMeta> & { status?: ExamStatus; updatedAt: number }): Promise<void>;
  /** Refuses (returns "has-attempts") once anyone has sat the exam. */
  deleteExam(id: string): Promise<"ok" | "has-attempts">;
  insertQuestion(examId: string, question: Question): Promise<void>;
  /** Returns how many questions remain. */
  deleteQuestion(examId: string, questionId: string): Promise<number>;

  // attempts
  getAttempt(id: string): Promise<Attempt | undefined>;
  findAttempts(filter: { examId?: string; userId?: string; submitted?: boolean; limit?: number }): Promise<Attempt[]>;
  /** "conflict" when the student already has an unsubmitted attempt for this exam. */
  insertAttempt(attempt: Attempt): Promise<"ok" | "conflict">;
  /** Writes the submission only if the attempt is still unsubmitted. Returns false otherwise. */
  completeAttempt(id: string, userId: string, patch: Required<Pick<Attempt, "submittedAt" | "reason" | "answers" | "strikes" | "result">>): Promise<boolean>;
  /** Submitted scores per exam, for ranking. */
  scoresByExam(examIds: string[]): Promise<Map<string, number[]>>;
  /** How many papers have been submitted in total. Cheap enough for a public counter. */
  countSubmissions(): Promise<number>;
  /** Newest submitted scores, without the heavy answer/result columns. */
  listRecentScores(limit: number): Promise<ScoreRow[]>;

  // anti-cheat log
  /** Also bumps the attempt's strike counter when `strike` is true. */
  insertViolation(v: StoredViolation): Promise<void>;
  countStrikes(attemptId: string): Promise<number>;
  listViolations(filter: { strikeOnly?: boolean; attemptId?: string; since?: number; limit?: number }): Promise<StoredViolation[]>;
}
