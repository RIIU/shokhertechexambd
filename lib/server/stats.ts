import "server-only";
import { store } from "./store";
import { rankFrom } from "./attempts";
import { getSubjects } from "@/lib/data/catalog";
import type { ExamType, Level, StreamId } from "@/lib/types";

export interface AttemptRow {
  attemptId: string;
  examId: string;
  titleBn: string;
  type: ExamType;
  subjectId: string;
  submittedAt?: number;
  startedAt: number;
  endsAt: number;
  score?: number;
  totalMarks?: number;
  percent?: number;
  accuracy?: number;
  strikes: number;
  rank?: number;
  participants?: number;
  reason?: string;
}

function subjectName(level: Level, stream: StreamId, subjectId: string): string {
  return getSubjects(level, stream).find((s) => s.id === subjectId)?.nameBn ?? subjectId;
}

export async function studentDashboard(userId: string) {
  const s = await store();
  const mine = await s.findAttempts({ userId });
  const examIds = [...new Set(mine.map((a) => a.examId))];
  const [exams, scores] = await Promise.all([Promise.all(examIds.map((id) => s.getExam(id))), s.scoresByExam(examIds)]);
  const examById = new Map(exams.filter((e) => e !== undefined).map((e) => [e.id, e]));

  const rows: AttemptRow[] = mine
    .map((a) => {
      const exam = examById.get(a.examId);
      const r = a.result;
      const rank = r ? rankFrom(scores.get(a.examId), r.score) : undefined;
      return {
        attemptId: a.id,
        examId: a.examId,
        titleBn: exam?.titleBn ?? "মুছে ফেলা পরীক্ষা",
        type: exam?.type ?? "practice",
        subjectId: exam?.subjectId ?? "",
        submittedAt: a.submittedAt,
        startedAt: a.startedAt,
        endsAt: a.endsAt,
        score: r?.score,
        totalMarks: r?.totalMarks,
        percent: r && r.totalMarks > 0 ? Math.round((r.score / r.totalMarks) * 100) : undefined,
        accuracy: r?.accuracy,
        strikes: a.strikes,
        rank: rank?.rank,
        participants: rank?.participants,
        reason: a.reason,
      };
    })
    .sort((x, y) => (y.submittedAt ?? y.startedAt) - (x.submittedAt ?? x.startedAt));

  const done = rows.filter((r) => r.submittedAt);
  const now = Date.now();
  const inProgress = rows.filter((r) => !r.submittedAt && r.endsAt > now);
  const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0);

  // Subject performance (average % per subject).
  const bySubject = new Map<string, { total: number; count: number; level: Level; stream: StreamId }>();
  for (const r of done) {
    const exam = examById.get(r.examId);
    if (!exam || r.percent === undefined) continue;
    const cur = bySubject.get(exam.subjectId) ?? { total: 0, count: 0, level: exam.level, stream: exam.stream };
    cur.total += r.percent;
    cur.count += 1;
    bySubject.set(exam.subjectId, cur);
  }

  return {
    totals: {
      taken: done.length,
      avgPercent: avg(done.map((r) => r.percent ?? 0)),
      avgAccuracy: avg(done.map((r) => r.accuracy ?? 0)),
      bestRank: done.reduce<number | null>((best, r) => (r.rank && (best === null || r.rank < best) ? r.rank : best), null),
    },
    trend: [...done]
      .reverse()
      .slice(-12)
      .map((r, i) => ({ n: i + 1, percent: r.percent ?? 0, title: r.titleBn })),
    subjects: [...bySubject.entries()]
      .map(([id, v]) => ({ id, name: subjectName(v.level, v.stream, id), percent: Math.round(v.total / v.count), count: v.count }))
      .sort((a, b) => b.percent - a.percent),
    recent: done.slice(0, 8),
    inProgress,
  };
}

export async function adminOverview() {
  const s = await store();
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const fortnightAgo = now - 15 * 24 * 60 * 60 * 1000;

  const [users, exams, open, recentSubmitted, strikes24h, recentAlerts] = await Promise.all([
    s.listUsers(),
    s.listExams(),
    s.findAttempts({ submitted: false }),
    s.findAttempts({ submitted: true, limit: 5000 }),
    s.listViolations({ strikeOnly: true, since: dayAgo }),
    s.listViolations({ strikeOnly: true, limit: 6 }),
  ]);
  const userById = new Map(users.map((u) => [u.id, u]));
  const examById = new Map(exams.map((e) => [e.id, e]));
  const submitted = recentSubmitted.filter((a) => (a.submittedAt ?? 0) >= fortnightAgo);
  const live = open.filter((a) => a.endsAt > now);

  // Submissions per day for the last 14 days.
  const days = Array.from({ length: 14 }, (_, i) => {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (13 - i));
    return start.getTime();
  });
  const perDay = days.map((d, i) => ({
    day: d,
    count: submitted.filter((a) => a.submittedAt! >= d && a.submittedAt! < (days[i + 1] ?? Infinity)).length,
  }));

  return {
    kpis: {
      students: users.filter((u) => u.role === "student").length,
      newStudents24h: users.filter((u) => u.role === "student" && u.createdAt >= dayAgo).length,
      publishedExams: exams.filter((e) => e.status === "published").length,
      draftExams: exams.filter((e) => e.status === "draft").length,
      submissions24h: submitted.filter((a) => a.submittedAt! >= dayAgo).length,
      submissionsTotal: recentSubmitted.length,
      liveNow: live.length,
      strikes24h: strikes24h.length,
    },
    perDay,
    live: live
      .map((a) => ({
        attemptId: a.id,
        student: userById.get(a.userId)?.name ?? "—",
        phone: userById.get(a.userId)?.phone ?? "",
        exam: examById.get(a.examId)?.titleBn ?? a.examId,
        endsAt: a.endsAt,
        strikes: a.strikes,
      }))
      .sort((a, b) => b.strikes - a.strikes),
    recentAlerts: recentAlerts.map((v) => ({
      ...v,
      student: v.userId ? userById.get(v.userId)?.name ?? "—" : "—",
      exam: examById.get(v.examId)?.titleBn ?? v.examId,
    })),
  };
}
