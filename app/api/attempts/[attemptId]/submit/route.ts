import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/server/auth";
import { getExam } from "@/lib/server/exams";
import { getUserAttempt, submitAttempt } from "@/lib/server/attempts";
import { parseSubmitPayload } from "@/lib/exams/grading";
import { DEVICE_COOKIE, isAttemptDevice, isStrict } from "@/lib/server/strict-exam";

export const dynamic = "force-dynamic";

/**
 * Grades a submission server-side. The answer key never reaches the browser
 * before this point, time taken comes from the server's own start time, and
 * each attempt can be submitted once.
 */
export async function POST(request: Request, { params }: { params: { attemptId: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  const attempt = await getUserAttempt(params.attemptId, user.id);
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

  // Strict exams: the answers are the ones saved question by question on the server.
  if (isStrict(exam)) {
    if (!isAttemptDevice(attempt.id, cookies().get(`${DEVICE_COOKIE}_${attempt.id}`)?.value)) {
      return NextResponse.json({ error: "other-device" }, { status: 423 });
    }
    const saved = attempt.answers ?? {};
    payload.answers = Object.fromEntries(exam.questions.map((q) => [q.id, saved[q.id] ?? null]));
  }

  const res = await submitAttempt(attempt.id, user.id, exam, payload);
  if (!res.ok) {
    return NextResponse.json({ error: res.error, attemptId: attempt.id }, { status: res.error === "already-submitted" ? 409 : 404 });
  }
  return NextResponse.json({ attemptId: res.attemptId }, { headers: { "Cache-Control": "no-store" } });
}
