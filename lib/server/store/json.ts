import "server-only";
import { mutateDb, readDb } from "../db";
import type { Store } from "./types";
import type { StoredExam } from "@/lib/types";

const byNewest = <T extends { createdAt: number }>(a: T, b: T) => b.createdAt - a.createdAt;

/** Development driver: a JSON file under .data/ (see ../db.ts). */
export const jsonStore: Store = {
  kind: "json",

  async findUserByPhone(phone) {
    return (await readDb()).users.find((u) => u.phone === phone);
  },
  async getUser(id) {
    return (await readDb()).users.find((u) => u.id === id);
  },
  async getUsers(ids) {
    const set = new Set(ids);
    return (await readDb()).users.filter((u) => set.has(u.id));
  },
  insertUser(user) {
    return mutateDb((db) => {
      if (db.users.some((u) => u.phone === user.phone)) return "phone-taken" as const;
      db.users.push(user);
      return "ok" as const;
    });
  },
  async listUsers() {
    return [...(await readDb()).users].sort(byNewest);
  },
  async updateUser(id, patch) {
    await mutateDb((db) => {
      const u = db.users.find((x) => x.id === id);
      if (u) Object.assign(u, patch);
    });
  },
  async setUserBlocked(id, blocked) {
    await mutateDb((db) => {
      const u = db.users.find((x) => x.id === id);
      if (u) u.blocked = blocked;
    });
  },
  async hasAdmin() {
    return (await readDb()).users.some((u) => u.role === "admin");
  },
  async countStudents() {
    return (await readDb()).users.filter((u) => u.role === "student" && !u.blocked).length;
  },

  async getExam(id) {
    return (await readDb()).exams.find((e) => e.id === id);
  },
  async listExamCards(filter) {
    return (await readDb())
      .exams.filter(
        (e) =>
          (!filter?.level || e.level === filter.level) &&
          (!filter?.stream || e.stream === filter.stream) &&
          (!filter?.status || e.status === filter.status) &&
          (!filter?.type || e.type === filter.type),
      )
      .sort(byNewest)
      .map((e) => ({
        id: e.id,
        titleBn: e.titleBn,
        level: e.level,
        stream: e.stream,
        subjectId: e.subjectId,
        type: e.type,
        durationSec: e.durationSec,
        questionCount: e.questions.length,
        totalMarks: e.questions.reduce((sum, q) => sum + Number(q.marks ?? 0), 0),
        isPaid: Boolean(e.isPaid),
        price: e.price ?? 0,
        createdAt: e.createdAt,
      }));
  },
  async listExams(filter) {
    return (await readDb()).exams
      .filter(
        (e) =>
          (!filter?.level || e.level === filter.level) &&
          (!filter?.stream || e.stream === filter.stream) &&
          (!filter?.status || e.status === filter.status),
      )
      .sort(byNewest);
  },
  async insertExam(exam) {
    await mutateDb((db) => {
      if (!db.exams.some((e) => e.id === exam.id)) db.exams.push(structuredClone(exam));
    });
  },
  async updateExam(id, patch) {
    await mutateDb((db) => {
      const e = db.exams.find((x) => x.id === id);
      if (e) Object.assign(e, patch);
    });
  },
  deleteExam(id) {
    return mutateDb((db) => {
      if (db.attempts.some((a) => a.examId === id)) return "has-attempts" as const;
      db.exams = db.exams.filter((e) => e.id !== id);
      db.violations = db.violations.filter((v) => v.examId !== id);
      return "ok" as const;
    });
  },
  async insertQuestion(examId, question) {
    await mutateDb((db) => {
      db.exams.find((e) => e.id === examId)?.questions.push(question);
    });
  },
  deleteQuestion(examId, questionId) {
    return mutateDb((db) => {
      const e: StoredExam | undefined = db.exams.find((x) => x.id === examId);
      if (!e) return 0;
      e.questions = e.questions.filter((q) => q.id !== questionId);
      return e.questions.length;
    });
  },

  async getAttempt(id) {
    return (await readDb()).attempts.find((a) => a.id === id);
  },
  async findAttempts({ examId, userId, submitted, limit }) {
    const rows = (await readDb()).attempts
      .filter(
        (a) =>
          (!examId || a.examId === examId) &&
          (!userId || a.userId === userId) &&
          (submitted === undefined || Boolean(a.submittedAt) === submitted),
      )
      .sort((a, b) => (b.submittedAt ?? b.startedAt) - (a.submittedAt ?? a.startedAt));
    return limit ? rows.slice(0, limit) : rows;
  },
  insertAttempt(attempt) {
    return mutateDb((db) => {
      if (db.attempts.some((a) => a.examId === attempt.examId && a.userId === attempt.userId && !a.submittedAt)) return "conflict" as const;
      db.attempts.push(attempt);
      return "ok" as const;
    });
  },
  completeAttempt(id, userId, patch) {
    return mutateDb((db) => {
      const a = db.attempts.find((x) => x.id === id && x.userId === userId);
      if (!a || a.submittedAt) return false;
      Object.assign(a, patch);
      return true;
    });
  },
  async scoresByExam(examIds) {
    const set = new Set(examIds);
    const map = new Map<string, number[]>();
    for (const a of (await readDb()).attempts) {
      if (!a.result || !set.has(a.examId)) continue;
      (map.get(a.examId) ?? map.set(a.examId, []).get(a.examId)!).push(a.result.score);
    }
    return map;
  },
  async countSubmissions() {
    return (await readDb()).attempts.filter((a) => a.submittedAt).length;
  },
  async listRecentScores(limit) {
    return (await readDb())
      .attempts.filter((a) => a.submittedAt)
      .sort((a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0))
      .slice(0, limit)
      .map((a) => ({ userId: a.userId, examId: a.examId, score: a.result?.score ?? 0, submittedAt: a.submittedAt ?? a.startedAt }));
  },

  async insertViolation(v) {
    await mutateDb((db) => {
      db.violations.push(v);
      if (v.strike && v.attemptId) {
        const a = db.attempts.find((x) => x.id === v.attemptId && !x.submittedAt);
        if (a) a.strikes += 1;
      }
      if (db.violations.length > 20000) db.violations.splice(0, db.violations.length - 20000);
    });
  },
  async countStrikes(attemptId) {
    return (await readDb()).violations.filter((v) => v.attemptId === attemptId && v.strike).length;
  },
  async listViolations({ strikeOnly, attemptId, since, limit }) {
    const rows = (await readDb()).violations
      .filter((v) => (!strikeOnly || v.strike) && (!attemptId || v.attemptId === attemptId) && (!since || v.at >= since))
      .sort((a, b) => b.at - a.at);
    return limit ? rows.slice(0, limit) : rows;
  },
};
