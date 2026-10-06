import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { getCurrentUser } from "@/lib/server/auth";
import { getExam, getPublishedExam } from "@/lib/server/exams";
import { startAttempt } from "@/lib/server/attempts";
import { clientIp } from "@/lib/server/request";
import { DEVICE_COOKIE, deviceToken, isAttemptDevice, isStrict } from "@/lib/server/strict-exam";

export const dynamic = "force-dynamic";

/** Creates (or resumes) the caller's attempt; the deadline is set by the server clock. */
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

  // Admins may test-drive draft exams.
  const exam = user.role === "admin" ? await getExam(params.id) : await getPublishedExam(params.id);
  if (!exam) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

  const { hasAccessToExam } = await import("@/lib/server/enrollments");
  const allowed = await hasAccessToExam(exam, user);
  if (!allowed) {
    return NextResponse.json({ error: "payment-required", message: "পেইড লাইভ পরীক্ষায় অংশ নিতে ফি প্রদান প্রয়োজন।" }, { status: 403 });
  }

  const res = await startAttempt(
    exam,
    user.id,
    { ip: clientIp(), userAgent: headers().get("user-agent")?.slice(0, 200) },
    { ignoreSchedule: user.role === "admin" },
  );
  if (!res.ok) {
    if (res.error === "already-submitted") return NextResponse.json({ error: res.error, attemptId: res.attemptId }, { status: 409 });
    return NextResponse.json({ error: res.error, startsAt: exam.startsAt, closesAt: exam.closesAt }, { status: 403 });
  }

  const { id, startedAt, endsAt, strikes } = res.attempt;

  // Strict exams: only the browser that started the attempt may continue it.
  if (isStrict(exam)) {
    const cookieName = `${DEVICE_COOKIE}_${id}`;
    if (res.created) {
      cookies().set(cookieName, deviceToken(id), {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
        path: "/",
        maxAge: Math.ceil((endsAt - Date.now()) / 1000) + 600,
      });
    } else if (!isAttemptDevice(id, cookies().get(cookieName)?.value)) {
      return NextResponse.json({ error: "other-device" }, { status: 423 });
    }
  }

  return NextResponse.json({ attempt: { id, startedAt, endsAt, strikes, serverNow: Date.now() } }, { headers: { "Cache-Control": "no-store" } });
}
