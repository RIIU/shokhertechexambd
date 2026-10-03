import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/server/auth";
import { getExam, getPublishedExam } from "@/lib/server/exams";
import { startAttempt } from "@/lib/server/attempts";
import { clientIp } from "@/lib/server/request";

export const dynamic = "force-dynamic";

/** Creates (or resumes) the caller's attempt; the deadline is set by the server clock. */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  // Admins may test-drive draft exams.
  const exam = user.role === "admin" ? await getExam(params.id) : await getPublishedExam(params.id);
  if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

  const res = await startAttempt(exam, user.id, { ip: clientIp(), userAgent: headers().get("user-agent")?.slice(0, 200) });
  if (!res.ok) return NextResponse.json({ error: res.error, attemptId: res.attemptId }, { status: 409 });

  const { id, startedAt, endsAt, strikes } = res.attempt;
  return NextResponse.json({ attempt: { id, startedAt, endsAt, strikes, serverNow: Date.now() } }, { headers: { "Cache-Control": "no-store" } });
}
