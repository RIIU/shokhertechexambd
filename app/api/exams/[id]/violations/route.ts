import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/auth";
import { getExam } from "@/lib/server/exams";
import { recordViolation } from "@/lib/server/attempts";
import { clientIp } from "@/lib/server/request";
import type { ViolationKind } from "@/lib/types";

export const dynamic = "force-dynamic";

const KINDS: readonly ViolationKind[] = [
  "tab-hidden",
  "window-blur",
  "fullscreen-exit",
  "devtools-open",
  "blocked-shortcut",
  "context-menu",
  "clipboard",
  "watermark-tamper",
  "split-screen",
  "extension",
  "multi-screen",
];

/**
 * Receives anti-cheat events from AntiCheatWrapper (sent with sendBeacon, so
 * they arrive even while the tab is being hidden) and stores them for the
 * admin alert log. `?attempt=` links the event to the caller's attempt.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  if (!(await getExam(params.id))) return NextResponse.json({ error: "Exam not found" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const kind = body.kind as ViolationKind;
  if (!KINDS.includes(kind)) return NextResponse.json({ error: "Unknown violation kind" }, { status: 422 });

  await recordViolation(
    { kind, strike: Boolean(body.strike), detail: typeof body.detail === "string" ? body.detail.slice(0, 120) : undefined, at: Date.now() },
    {
      examId: params.id,
      attemptId: new URL(request.url).searchParams.get("attempt") ?? undefined,
      userId: user.id,
      ip: clientIp(),
    },
  );
  return new NextResponse(null, { status: 202 });
}
