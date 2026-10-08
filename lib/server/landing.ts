import "server-only";
import { store } from "./store";
import { getSubjects, LEVELS, STREAMS } from "@/lib/data/catalog";
import type { ExamCard } from "./store/types";
import type { Level, StreamId } from "@/lib/types";

export interface LandingStats {
  students: number;
  exams: number;
  questions: number;
  submissions: number;
}

export interface LandingExam {
  id: string;
  titleBn: string;
  levelName: string;
  streamName: string;
  subjectName: string;
  type: ExamCard["type"];
  durationMin: number;
  questionCount: number;
  totalMarks: number;
  isPaid: boolean;
  price: number;
}

export interface TopLearner {
  /** First name + initial of the rest — students are minors, so no full public name. */
  name: string;
  percent: number;
  levelName: string;
  streamName: string;
}

const subjectName = (level: Level, stream: StreamId, subjectId: string) =>
  getSubjects(level, stream).find((s) => s.id === subjectId)?.nameBn ?? subjectId;

export function maskName(full: string): string {
  const parts = full.trim().split(/\s+/);
  if (parts.length < 2) return parts[0] ?? "—";
  return `${parts[0]} ${parts.slice(1).map((p) => `${p[0]}.`).join(" ")}`;
}

const toLandingExam = (c: ExamCard): LandingExam => ({
  id: c.id,
  titleBn: c.titleBn,
  levelName: LEVELS[c.level].nameBn,
  streamName: STREAMS[c.stream].nameBn,
  subjectName: subjectName(c.level, c.stream, c.subjectId),
  type: c.type,
  durationMin: Math.round(c.durationSec / 60),
  questionCount: c.questionCount,
  totalMarks: c.totalMarks,
  isPaid: c.isPaid,
  price: c.price,
});

/**
 * Everything the landing page shows, from real rows. Uses the question-free
 * card/score queries so a homepage render never drags answer keys along.
 */
export async function landingData() {
  const s = await store();
  const [students, published, submissions, recent] = await Promise.all([
    s.countStudents(),
    s.listExamCards({ status: "published" }),
    s.countSubmissions(),
    s.listRecentScores(400),
  ]);

  const byId = new Map(published.map((c) => [c.id, c]));
  const questions = published.reduce((sum, c) => sum + c.questionCount, 0);

  // Best percentage each student has posted on a published exam.
  const best = new Map<string, { percent: number; level: Level; stream: StreamId }>();
  for (const r of recent) {
    const exam = byId.get(r.examId);
    if (!exam || exam.totalMarks <= 0) continue;
    const percent = Math.max(0, Math.round((r.score / exam.totalMarks) * 100));
    const cur = best.get(r.userId);
    if (!cur || percent > cur.percent) best.set(r.userId, { percent, level: exam.level, stream: exam.stream });
  }
  const top = [...best.entries()].sort((a, b) => b[1].percent - a[1].percent).slice(0, 20);
  const users = await s.getUsers(top.map(([id]) => id));
  const userById = new Map(users.filter((u) => u.role === "student" && !u.blocked).map((u) => [u.id, u]));
  const leaderboard: TopLearner[] = top
    .flatMap(([id, v]) => {
      const u = userById.get(id);
      if (!u) return [];
      return [{ name: maskName(u.name), percent: v.percent, levelName: LEVELS[v.level].nameBn, streamName: STREAMS[v.stream].nameBn }];
    })
    .slice(0, 8);

  return {
    stats: { students, exams: published.length, questions, submissions } satisfies LandingStats,
    exams: published.map(toLandingExam),
    leaderboard,
  };
}
