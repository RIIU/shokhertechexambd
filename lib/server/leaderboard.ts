import "server-only";
import { listAttempts } from "./attempts";
import { getUsers } from "./users";
import type { Attempt } from "@/lib/types";

export interface LeaderboardRow {
  rank: number;
  attemptId: string;
  userId: string;
  name: string;
  institution?: string;
  avatarUrl?: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  timeTakenSec: number;
}

/**
 * Best submission per student for one exam, highest score first and the
 * faster time breaking ties. Ranks match rankFrom() (ties on score share a rank).
 */
export async function examLeaderboard(examId: string): Promise<LeaderboardRow[]> {
  const attempts = await listAttempts({ examId, submittedOnly: true });

  const best = new Map<string, Attempt>();
  for (const a of attempts) {
    if (!a.result) continue;
    const prev = best.get(a.userId)?.result;
    if (!prev || a.result.score > prev.score || (a.result.score === prev.score && a.result.timeTakenSec < prev.timeTakenSec)) {
      best.set(a.userId, a);
    }
  }

  const ordered = [...best.values()].sort(
    (a, b) => b.result!.score - a.result!.score || a.result!.timeTakenSec - b.result!.timeTakenSec,
  );
  const users = new Map((await getUsers(ordered.map((a) => a.userId))).map((u) => [u.id, u]));

  // Rank among every submission, same as the result page.
  const scores = attempts.filter((a) => a.result).map((a) => a.result!.score);
  return ordered.map((a) => {
    const r = a.result!;
    const u = users.get(a.userId);
    return {
      rank: 1 + scores.filter((s) => s > r.score).length,
      attemptId: a.id,
      userId: a.userId,
      name: u?.name ?? "শিক্ষার্থী",
      institution: u?.institution,
      avatarUrl: u?.avatarUrl,
      score: r.score,
      totalMarks: r.totalMarks,
      accuracy: r.accuracy,
      timeTakenSec: r.timeTakenSec,
    };
  });
}
