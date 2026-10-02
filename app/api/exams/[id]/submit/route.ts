import { NextResponse } from "next/server";
import { getExam, gradeExam, parseSubmitPayload } from "@/lib/exams/repository";

export const dynamic = "force-dynamic";

/**
 * Grades a submission server-side. The answer key never reaches the browser
 * before this point, so inspecting the exam page's JS/network reveals nothing.
 *
 * Production TODOs: authenticate the candidate, reject a second submission for
 * the same attempt, and compare timeTakenSec against the server-recorded start.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const exam = getExam(params.id);
  if (!exam) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payload = parseSubmitPayload(body, exam);
  if (!payload) {
    return NextResponse.json({ error: "Malformed submission" }, { status: 422 });
  }

  return NextResponse.json(gradeExam(exam, payload), {
    headers: { "Cache-Control": "no-store" },
  });
}
