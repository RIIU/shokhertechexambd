import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/server/auth";
import { DEVICE_COOKIE, answerCurrent, guardStrictAttempt } from "@/lib/server/strict-exam";
import type { OptionId } from "@/lib/types";

export const dynamic = "force-dynamic";

const OPTION_IDS: readonly OptionId[] = ["a", "b", "c", "d"];

/** Answers (or skips) the current question of a strict attempt and returns the next one. */
export async function POST(request: Request, { params }: { params: { attemptId: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  let body: { questionId?: unknown; optionId?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.questionId !== "string") return NextResponse.json({ error: "Malformed answer" }, { status: 422 });
  const optionId = OPTION_IDS.includes(body.optionId as OptionId) ? (body.optionId as OptionId) : null;

  const g = await guardStrictAttempt(params.attemptId, user.id, cookies().get(`${DEVICE_COOKIE}_${params.attemptId}`)?.value);
  if (!g.ok) return NextResponse.json({ error: g.error }, { status: g.status });

  const res = await answerCurrent(g.exam, g.attempt, body.questionId, optionId);
  if (!res.ok) return NextResponse.json({ error: res.error }, { status: res.error === "closed" ? 410 : 409 });
  return NextResponse.json(res.next ? { done: false, ...res.next } : { done: true }, { headers: { "Cache-Control": "no-store" } });
}
