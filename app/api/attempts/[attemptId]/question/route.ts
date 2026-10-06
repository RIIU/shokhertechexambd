import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/server/auth";
import { DEVICE_COOKIE, currentQuestion, guardAttempt } from "@/lib/server/strict-exam";

export const dynamic = "force-dynamic";

/** The one question a strict attempt is on (never earlier or later ones). */
export async function GET(_req: Request, { params }: { params: { attemptId: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const g = await guardAttempt(params.attemptId, user.id, cookies().get(`${DEVICE_COOKIE}_${params.attemptId}`)?.value);
  if (!g.ok) return NextResponse.json({ error: g.error }, { status: g.status });
  if (Date.now() > g.attempt.endsAt) return NextResponse.json({ done: true, reason: "time-up" }, { headers: { "Cache-Control": "no-store" } });

  const current = currentQuestion(g.exam, g.attempt);
  return NextResponse.json(current ? { done: false, ...current } : { done: true }, { headers: { "Cache-Control": "no-store" } });
}
