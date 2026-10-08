import "server-only";
import { createClient, type PostgrestError, type SupabaseClient } from "@supabase/supabase-js";
import type { Store } from "./types";
import type { ExamCard } from "./types";
import type { Attempt, ExamResult, ExamType, Level, OptionId, PaymentRequest, Question, QuestionOption, Role, StoredExam, StoredViolation, StreamId, SubmitReason, User, ViolationKind } from "@/lib/types";

/**
 * Supabase (Postgres) driver. Server-side only: it uses the secret key
 * (sb_secret_… or legacy service_role), which bypasses Row Level Security.
 * Never import this from client code.
 * Schema: supabase/migrations/*.sql
 */

/* ------------------------------ Row shapes ------------------------------ */

interface UserRow {
  id: string;
  name: string;
  phone: string;
  password_hash: string;
  role: Role;
  level: Level | null;
  stream: StreamId | null;
  institution: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  bio?: string | null;
  blocked: boolean;
  created_at: string;
}
interface QuestionRow {
  id: string;
  exam_id: string;
  position: number;
  text: string;
  options: QuestionOption[];
  correct_option_id: OptionId;
  explanation: string;
  topic: string;
  marks: number;
}
interface ExamRow {
  id: string;
  title_bn: string;
  title_en: string;
  level: Level;
  stream: StreamId;
  subject_id: string;
  type: ExamType;
  duration_sec: number;
  negative_mark: number;
  max_warnings: number;
  show_solutions?: boolean;
  is_paid?: boolean;
  price?: number;
  status: "draft" | "published";
  created_at: string;
  updated_at: string;
  questions?: QuestionRow[];
}
interface AttemptRow {
  id: string;
  exam_id: string;
  user_id: string;
  started_at: string;
  ends_at: string;
  submitted_at: string | null;
  reason: SubmitReason | null;
  answers: Attempt["answers"] | null;
  strikes: number;
  score: number | null;
  result: Omit<ExamResult, "rank" | "participants"> | null;
  ip: string | null;
  user_agent: string | null;
}
interface ViolationRow {
  id: string;
  exam_id: string;
  attempt_id: string | null;
  user_id: string | null;
  kind: ViolationKind;
  strike: boolean;
  detail: string | null;
  ip: string | null;
  at: string;
}

/* ------------------------------- Mapping -------------------------------- */

const ms = (iso: string) => Date.parse(iso);
const iso = (n: number) => new Date(n).toISOString();
const opt = <T>(v: T | null): T | undefined => (v === null ? undefined : v);

/** A column value wins when present; an empty string means "cleared", null means "never migrated". */
const colOr = (col: string | null | undefined, legacy: string | undefined) =>
  col == null ? legacy : col || undefined;

const toUser = (r: UserRow): User => {
  let institution = opt(r.institution);
  let meta: Record<string, unknown> = {};

  if (institution && institution.startsWith('{"') && institution.endsWith('}')) {
    try {
      const parsed: unknown = JSON.parse(institution);
      if (typeof parsed === "object" && parsed !== null) meta = parsed as Record<string, unknown>;
    } catch {
      // not json
    }
    if (Object.keys(meta).length) institution = (meta.institution ?? meta.inst ?? "") as string;
  }

  const str = (k: string) => (typeof meta[k] === "string" ? (meta[k] as string) : undefined);

  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    passwordHash: r.password_hash,
    role: r.role,
    level: opt(r.level),
    stream: opt(r.stream),
    institution: institution || undefined,
    avatarUrl: colOr(r.avatar_url, str("avatarUrl")),
    coverUrl: colOr(r.cover_url, str("coverUrl")),
    bio: colOr(r.bio, str("bio")),
    enrolledExams: Array.isArray(meta.enrolledExams) && meta.enrolledExams.length ? (meta.enrolledExams as string[]) : undefined,
    subscriptionStatus: meta.subscriptionStatus as User["subscriptionStatus"],
    subscriptionValidUntil: meta.subscriptionValidUntil ? Number(meta.subscriptionValidUntil) : undefined,
    paymentRequests: Array.isArray(meta.paymentRequests) ? (meta.paymentRequests as PaymentRequest[]) : undefined,
    latestPayment: meta.latestPayment as PaymentRequest | undefined,
    blocked: r.blocked,
    createdAt: ms(r.created_at),
  };
};

/**
 * `institution` holds the school name plus the enrolment/subscription meta that has
 * no column of its own. Avatar, cover and bio live in real columns.
 */
export const packInstitution = (u: Partial<User>): string | null => {
  const inst = typeof u.institution === "string" ? u.institution : null;
  const hasMeta =
    (u.enrolledExams?.length ?? 0) > 0 ||
    u.subscriptionStatus !== undefined ||
    u.subscriptionValidUntil !== undefined ||
    u.paymentRequests !== undefined ||
    u.latestPayment !== undefined;

  if (!hasMeta) return inst;

  const meta: Record<string, unknown> = { inst: inst ?? "" };
  if (u.enrolledExams !== undefined) meta.enrolledExams = u.enrolledExams;
  if (u.subscriptionStatus !== undefined) meta.subscriptionStatus = u.subscriptionStatus;
  if (u.subscriptionValidUntil !== undefined) meta.subscriptionValidUntil = u.subscriptionValidUntil;
  if (u.paymentRequests !== undefined) meta.paymentRequests = u.paymentRequests;
  if (u.latestPayment !== undefined) meta.latestPayment = u.latestPayment;
  return JSON.stringify(meta);
};

const fromUser = (u: User): UserRow => ({
  id: u.id,
  name: u.name,
  phone: u.phone,
  password_hash: u.passwordHash,
  role: u.role,
  level: u.level ?? null,
  stream: u.stream ?? null,
  institution: packInstitution(u),
  avatar_url: u.avatarUrl ?? null,
  cover_url: u.coverUrl ?? null,
  bio: u.bio ?? null,
  blocked: Boolean(u.blocked),
  created_at: iso(u.createdAt),
});

const toQuestion = (r: QuestionRow): Question => ({
  id: r.id,
  text: r.text,
  options: r.options,
  correctOptionId: r.correct_option_id,
  explanation: r.explanation,
  topic: r.topic,
  marks: Number(r.marks),
});
const fromQuestion = (examId: string, q: Question, position: number): QuestionRow => ({
  id: q.id,
  exam_id: examId,
  position,
  text: q.text,
  options: q.options,
  correct_option_id: q.correctOptionId,
  explanation: q.explanation,
  topic: q.topic,
  marks: q.marks,
});

const HIDE_SOLUTIONS_TAG = "[hide_solutions]";

/** Strips the flags this driver used to smuggle into `title_en` before the columns existed. */
export const cleanExamTitle = (raw: string): string =>
  raw
    .replace(HIDE_SOLUTIONS_TAG, "")
    .replace(/\[paid:\d+\]/g, "")
    .replace(/\[paid\]/g, "")
    .trim();

/**
 * `show_solutions` still honors the old `[hide_solutions]` title tag so rows
 * written before the column keep their setting. Paywall state comes only from
 * the columns: every exam is free until the admin marks it paid again.
 */
const examFlags = (r: { title_en?: string | null; show_solutions?: boolean; is_paid?: boolean; price?: number }) => {
  const legacyTitle = r.title_en ?? "";
  return {
    titleEn: cleanExamTitle(legacyTitle),
    showSolutions: !(r.show_solutions === false || legacyTitle.includes(HIDE_SOLUTIONS_TAG)),
    isPaid: Boolean(r.is_paid),
    price: Number(r.price ?? 0),
  };
};

const toExam = (r: ExamRow): StoredExam => {
  const flags = examFlags(r);

  return {
    id: r.id,
    titleBn: r.title_bn,
    titleEn: flags.titleEn || r.title_bn,
    level: r.level,
    stream: r.stream,
    subjectId: r.subject_id,
    type: r.type,
    durationSec: r.duration_sec,
    negativeMark: Number(r.negative_mark),
    maxWarnings: r.max_warnings,
    showSolutions: flags.showSolutions,
    isPaid: flags.isPaid,
    price: flags.price,
    status: r.status,
    createdAt: ms(r.created_at),
    updatedAt: ms(r.updated_at),
    questions: [...(r.questions ?? [])].sort((a, b) => a.position - b.position).map(toQuestion),
  };
};

const toAttempt = (r: AttemptRow): Attempt => ({
  id: r.id,
  examId: r.exam_id,
  userId: r.user_id,
  startedAt: ms(r.started_at),
  endsAt: ms(r.ends_at),
  submittedAt: r.submitted_at ? ms(r.submitted_at) : undefined,
  reason: opt(r.reason),
  answers: opt(r.answers),
  strikes: r.strikes,
  result: opt(r.result),
  ip: opt(r.ip),
  userAgent: opt(r.user_agent),
});

const toViolation = (r: ViolationRow): StoredViolation => ({
  id: r.id,
  examId: r.exam_id,
  attemptId: opt(r.attempt_id),
  userId: opt(r.user_id),
  kind: r.kind,
  strike: r.strike,
  detail: opt(r.detail),
  ip: opt(r.ip),
  at: ms(r.at),
});

/* ------------------------------- Client --------------------------------- */

let client: SupabaseClient | undefined;
export function db(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  // New `sb_secret_…` keys and legacy service_role JWTs both work; supabase-js sends
  // new-format keys only in the `apikey` header, as Supabase requires.
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set.");
  if (key.startsWith("sb_publishable_")) throw new Error("SUPABASE_SECRET_KEY must be the secret (sb_secret_…) key, not the publishable key.");
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    // Next.js caches fetch() in server components by default; database reads must always be fresh.
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
  });
  return client;
}

function check(error: PostgrestError | null, what: string): void {
  if (error) throw new Error(`[supabase] ${what}: ${error.message} (${error.code})`);
}

const PAGE = 1000; // Supabase's default max rows per request

/** Reads every row of a query, 1000 at a time (PostgREST caps each response). */
async function all<T>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: PostgrestError | null }>,
  what: string,
  limit = Infinity,
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; out.length < limit; from += PAGE) {
    const to = Math.min(from + PAGE, limit) - 1;
    const { data, error } = await build(from, to);
    check(error, what);
    out.push(...(data ?? []));
    if (!data || data.length < to - from + 1) break;
  }
  return out;
}

const EXAM_SELECT = "*, questions(*)";
const EXAM_CARD_SELECT =
  "id, title_bn, title_en, level, stream, subject_id, type, duration_sec, show_solutions, is_paid, price, status, created_at, questions(marks)";

interface ExamCardRow {
  id: string;
  title_bn: string;
  title_en?: string | null;
  level: Level;
  stream: StreamId;
  subject_id: string;
  type: ExamType;
  duration_sec: number;
  show_solutions?: boolean;
  is_paid?: boolean;
  price?: number;
  status: "draft" | "published";
  created_at: string;
  questions?: { marks: number }[];
}

const toExamCard = (r: ExamCardRow): ExamCard => {
  const flags = examFlags(r);
  const marks = r.questions ?? [];
  return {
    id: r.id,
    titleBn: r.title_bn,
    level: r.level,
    stream: r.stream,
    subjectId: r.subject_id,
    type: r.type,
    durationSec: r.duration_sec,
    questionCount: marks.length,
    totalMarks: marks.reduce((sum, q) => sum + Number(q.marks ?? 0), 0),
    isPaid: flags.isPaid,
    price: flags.price,
    createdAt: ms(r.created_at),
  };
};

/* -------------------------------- Driver -------------------------------- */

export const supabaseStore: Store = {
  kind: "supabase",

  /* users */
  async findUserByPhone(phone) {
    const { data, error } = await db().from("users").select("*").eq("phone", phone).maybeSingle<UserRow>();
    check(error, "findUserByPhone");
    return data ? toUser(data) : undefined;
  },
  async getUser(id) {
    const { data, error } = await db().from("users").select("*").eq("id", id).maybeSingle<UserRow>();
    check(error, "getUser");
    return data ? toUser(data) : undefined;
  },
  async getUsers(ids) {
    if (!ids.length) return [];
    const unique = [...new Set(ids)];
    const rows: UserRow[] = [];
    for (let i = 0; i < unique.length; i += 200) {
      const { data, error } = await db().from("users").select("*").in("id", unique.slice(i, i + 200));
      check(error, "getUsers");
      rows.push(...((data ?? []) as UserRow[]));
    }
    return rows.map(toUser);
  },
  async insertUser(user) {
    const { error } = await db().from("users").insert(fromUser(user));
    if (error?.code === "23505") return "phone-taken";
    check(error, "insertUser");
    return "ok";
  },
  async listUsers() {
    const rows = await all<UserRow>((f, t) => db().from("users").select("*").order("created_at", { ascending: false }).range(f, t), "listUsers");
    return rows.map(toUser);
  },
  async updateUser(id, patch) {
    const current = await supabaseStore.getUser(id);
    if (!current) throw new Error(`[supabase] updateUser: user ${id} not found`);

    const merged: User = { ...current, ...patch };
    const { error } = await db()
      .from("users")
      .update({
        name: merged.name,
        password_hash: merged.passwordHash,
        level: merged.level ?? null,
        stream: merged.stream ?? null,
        institution: packInstitution(merged),
        avatar_url: merged.avatarUrl ?? null,
        cover_url: merged.coverUrl ?? null,
        bio: merged.bio ?? null,
      })
      .eq("id", id);
    check(error, "updateUser");
  },
  async setUserBlocked(id, blocked) {
    const { error } = await db().from("users").update({ blocked }).eq("id", id).neq("role", "admin");
    check(error, "setUserBlocked");
  },
  async hasAdmin() {
    const { count, error } = await db().from("users").select("id", { count: "exact", head: true }).eq("role", "admin");
    check(error, "hasAdmin");
    return (count ?? 0) > 0;
  },
  async countStudents() {
    const { count, error } = await db()
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("role", "student")
      .eq("blocked", false);
    check(error, "countStudents");
    return count ?? 0;
  },

  /* exams */
  async getExam(id) {
    const { data, error } = await db().from("exams").select(EXAM_SELECT).eq("id", id).maybeSingle<ExamRow>();
    check(error, "getExam");
    return data ? toExam(data) : undefined;
  },
  async listExams(filter) {
    const rows = await all<ExamRow>((f, t) => {
      let q = db().from("exams").select(EXAM_SELECT);
      if (filter?.level) q = q.eq("level", filter.level);
      if (filter?.stream) q = q.eq("stream", filter.stream);
      if (filter?.status) q = q.eq("status", filter.status);
      return q.order("created_at", { ascending: false }).range(f, t);
    }, "listExams");
    return rows.map(toExam);
  },
  async listExamCards(filter) {
    const rows = await all<ExamCardRow>((f, t) => {
      let q = db().from("exams").select(EXAM_CARD_SELECT);
      if (filter?.level) q = q.eq("level", filter.level);
      if (filter?.stream) q = q.eq("stream", filter.stream);
      if (filter?.status) q = q.eq("status", filter.status);
      if (filter?.type) q = q.eq("type", filter.type);
      return q.order("created_at", { ascending: false }).range(f, t);
    }, "listExamCards");
    return rows.map(toExamCard);
  },
  async insertExam(exam) {
    const { questions, ...e } = exam;
    const { error } = await db()
      .from("exams")
      .upsert(
        {
          id: e.id,
          title_bn: e.titleBn,
          title_en: cleanExamTitle(e.titleEn || e.titleBn),
          level: e.level,
          stream: e.stream,
          subject_id: e.subjectId,
          type: e.type,
          duration_sec: e.durationSec,
          negative_mark: e.negativeMark,
          max_warnings: e.maxWarnings,
          show_solutions: e.showSolutions !== false,
          is_paid: Boolean(e.isPaid),
          price: e.price ?? 0,
          status: e.status,
          created_at: iso(e.createdAt),
          updated_at: iso(e.updatedAt),
        },
        { onConflict: "id", ignoreDuplicates: true },
      );
    check(error, "insertExam");
    if (questions.length) {
      const { error: qErr } = await db()
        .from("questions")
        .upsert(questions.map((q, i) => fromQuestion(e.id, q, i)), { onConflict: "exam_id,id", ignoreDuplicates: true });
      check(qErr, "insertExam/questions");
    }
  },
  async updateExam(id, patch) {
    const row: Record<string, unknown> = { updated_at: iso(patch.updatedAt) };
    if (patch.titleBn !== undefined) row.title_bn = patch.titleBn;
    const newTitle = patch.titleEn !== undefined ? patch.titleEn : patch.titleBn;
    if (newTitle !== undefined) row.title_en = cleanExamTitle(newTitle);
    if (patch.showSolutions !== undefined) row.show_solutions = patch.showSolutions;
    if (patch.isPaid !== undefined) row.is_paid = patch.isPaid;
    if (patch.price !== undefined) row.price = patch.price;
    if (patch.level !== undefined) row.level = patch.level;
    if (patch.stream !== undefined) row.stream = patch.stream;
    if (patch.subjectId !== undefined) row.subject_id = patch.subjectId;
    if (patch.type !== undefined) row.type = patch.type;
    if (patch.durationSec !== undefined) row.duration_sec = patch.durationSec;
    if (patch.negativeMark !== undefined) row.negative_mark = patch.negativeMark;
    if (patch.maxWarnings !== undefined) row.max_warnings = patch.maxWarnings;
    if (patch.status !== undefined) row.status = patch.status;
    const { error } = await db().from("exams").update(row).eq("id", id);
    check(error, "updateExam");
  },
  async deleteExam(id) {
    const { count, error } = await db().from("attempts").select("id", { count: "exact", head: true }).eq("exam_id", id);
    check(error, "deleteExam/count");
    if ((count ?? 0) > 0) return "has-attempts";
    const { error: delErr } = await db().from("exams").delete().eq("id", id);
    if (delErr?.code === "23503") return "has-attempts"; // someone started it meanwhile (FK restrict)
    check(delErr, "deleteExam");
    return "ok";
  },
  async insertQuestion(examId, question) {
    const { data, error } = await db()
      .from("questions")
      .select("position")
      .eq("exam_id", examId)
      .order("position", { ascending: false })
      .limit(1);
    check(error, "insertQuestion/position");
    const next = ((data as { position: number }[] | null)?.[0]?.position ?? -1) + 1;
    const { error: insErr } = await db().from("questions").insert(fromQuestion(examId, question, next));
    check(insErr, "insertQuestion");
  },
  async deleteQuestion(examId, questionId) {
    const { error } = await db().from("questions").delete().eq("exam_id", examId).eq("id", questionId);
    check(error, "deleteQuestion");
    const { count, error: cErr } = await db().from("questions").select("id", { count: "exact", head: true }).eq("exam_id", examId);
    check(cErr, "deleteQuestion/count");
    return count ?? 0;
  },

  /* attempts */
  async getAttempt(id) {
    const { data, error } = await db().from("attempts").select("*").eq("id", id).maybeSingle<AttemptRow>();
    check(error, "getAttempt");
    return data ? toAttempt(data) : undefined;
  },
  async findAttempts({ examId, userId, submitted, limit }) {
    const rows = await all<AttemptRow>(
      (f, t) => {
        let q = db().from("attempts").select("*");
        if (examId) q = q.eq("exam_id", examId);
        if (userId) q = q.eq("user_id", userId);
        if (submitted === true) q = q.not("submitted_at", "is", null);
        if (submitted === false) q = q.is("submitted_at", null);
        return q.order("submitted_at", { ascending: false, nullsFirst: true }).order("started_at", { ascending: false }).range(f, t);
      },
      "findAttempts",
      limit,
    );
    return rows.map(toAttempt);
  },
  async insertAttempt(a) {
    const { error } = await db()
      .from("attempts")
      .insert({
        id: a.id,
        exam_id: a.examId,
        user_id: a.userId,
        started_at: iso(a.startedAt),
        ends_at: iso(a.endsAt),
        strikes: a.strikes,
        ip: a.ip ?? null,
        user_agent: a.userAgent ?? null,
      });
    if (error?.code === "23505") return "conflict"; // attempts_one_open_idx
    check(error, "insertAttempt");
    return "ok";
  },
  async completeAttempt(id, userId, patch) {
    const { data, error } = await db()
      .from("attempts")
      .update({
        submitted_at: iso(patch.submittedAt),
        reason: patch.reason,
        answers: patch.answers,
        strikes: patch.strikes,
        score: patch.result.score,
        result: patch.result,
      })
      .eq("id", id)
      .eq("user_id", userId)
      .is("submitted_at", null) // first submission wins
      .select("id");
    check(error, "completeAttempt");
    return (data?.length ?? 0) > 0;
  },
  async scoresByExam(examIds) {
    const map = new Map<string, number[]>();
    const unique = [...new Set(examIds)];
    for (let i = 0; i < unique.length; i += 100) {
      const chunk = unique.slice(i, i + 100);
      const rows = await all<{ exam_id: string; score: number }>(
        (f, t) => db().from("attempts").select("exam_id, score").in("exam_id", chunk).not("submitted_at", "is", null).order("id").range(f, t),
        "scoresByExam",
      );
      for (const r of rows) (map.get(r.exam_id) ?? map.set(r.exam_id, []).get(r.exam_id)!).push(Number(r.score ?? 0));
    }
    return map;
  },
  async countSubmissions() {
    const { count, error } = await db()
      .from("attempts")
      .select("id", { count: "exact", head: true })
      .not("submitted_at", "is", null);
    check(error, "countSubmissions");
    return count ?? 0;
  },
  async listRecentScores(limit) {
    const rows = await all<{ user_id: string; exam_id: string; score: number; submitted_at: string }>(
      (f, t) =>
        db()
          .from("attempts")
          .select("user_id, exam_id, score, submitted_at")
          .not("submitted_at", "is", null)
          .order("submitted_at", { ascending: false })
          .range(f, t),
      "listRecentScores",
      limit,
    );
    return rows.map((r) => ({ userId: r.user_id, examId: r.exam_id, score: Number(r.score ?? 0), submittedAt: ms(r.submitted_at) }));
  },

  /* violations */
  async insertViolation(v) {
    const { error } = await db()
      .from("violations")
      .insert({
        id: v.id,
        exam_id: v.examId,
        attempt_id: v.attemptId ?? null,
        user_id: v.userId ?? null,
        kind: v.kind,
        strike: v.strike,
        detail: v.detail ?? null,
        ip: v.ip ?? null,
        at: iso(v.at),
      }); // trigger violations_bump_strikes updates attempts.strikes
    check(error, "insertViolation");
  },
  async countStrikes(attemptId) {
    const { count, error } = await db()
      .from("violations")
      .select("id", { count: "exact", head: true })
      .eq("attempt_id", attemptId)
      .eq("strike", true);
    check(error, "countStrikes");
    return count ?? 0;
  },
  async listViolations({ strikeOnly, attemptId, since, limit }) {
    const rows = await all<ViolationRow>(
      (f, t) => {
        let q = db().from("violations").select("*");
        if (strikeOnly) q = q.eq("strike", true);
        if (attemptId) q = q.eq("attempt_id", attemptId);
        if (since) q = q.gte("at", iso(since));
        return q.order("at", { ascending: false }).range(f, t);
      },
      "listViolations",
      limit,
    );
    return rows.map(toViolation);
  },
};
