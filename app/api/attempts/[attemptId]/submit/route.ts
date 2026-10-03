import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { getExam } from "@/lib/server/exams";
import { listAttempts, submitAttempt } from "@/lib/server/attempts";
import { parseSubmitPayload } from "@/lib/exams/grading";

export const dynamic = "force-dynamic";

/**
 * Grades a submission server-side. The answer key never reaches the browser
 * before this point, time taken comes from the server's own start time, and
 * each attempt can be submitted once.
 */
export async function POST(request: Request, { params }: { params: { attemptId: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const attempt = (await listAttempts({ userId: user.id })).find((a) => a.id === params.attemptId);
  if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  const exam = await getExam(attempt.examId);
  if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const payload = parseSubmitPayload(body, exam);
  if (!payload) return NextResponse.json({ error: "Malformed submission" }, { status: 422 });

  const res = await submitAttempt(attempt.id, user.id, exam, payload);
  if (!res.ok) {
    return NextResponse.json({ error: res.error, attemptId: attempt.id }, { status: res.error === "already-submitted" ? 409 : 404 });
  }
  return NextResponse.json({ attemptId: res.attemptId }, { headers: { "Cache-Control": "no-store" } });
}
