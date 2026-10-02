import { NextResponse } from "next/server";
import { getExam } from "@/lib/exams/repository";
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
];

/**
 * Receives anti-cheat events from AntiCheatWrapper (sent with sendBeacon, so
 * they arrive even while the tab is being hidden). In production, persist them
 * and push to the admin Live Exam Monitor over a websocket / SSE channel.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!getExam(params.id)) {
    return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!KINDS.includes(body.kind as ViolationKind)) {
    return NextResponse.json({ error: "Unknown violation kind" }, { status: 422 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  console.warn(
    `[anti-cheat] exam=${params.id} ip=${ip} kind=${String(body.kind)} strike=${Boolean(body.strike)} detail=${String(body.detail ?? "")}`,
  );

  return new NextResponse(null, { status: 202 });
}
