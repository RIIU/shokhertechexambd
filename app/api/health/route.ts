import { NextResponse } from "next/server";
import { activeDriver, store, supabaseServerKey } from "@/lib/server/store";
import { db } from "@/lib/server/store/supabase";
import { classifyError, isServerless, PROBLEM_HINTS, sessionSecretOk, type ProblemCode } from "@/lib/server/diagnose";

export const dynamic = "force-dynamic";

const TABLES = ["users", "exams", "questions", "attempts", "violations"] as const;

type Check = { ok: boolean; detail?: string; problem?: ProblemCode; hint?: string };
const fail = (problem: ProblemCode, detail?: string): Check => ({ ok: false, problem, hint: PROBLEM_HINTS[problem], detail });

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return "INVALID (must look like https://xxxx.supabase.co)";
  }
}

function keyKind(key: string | undefined): string {
  if (!key) return "missing";
  if (key.startsWith("sb_secret_")) return "sb_secret (ok)";
  if (key.startsWith("sb_publishable_")) return "sb_publishable (WRONG: use the secret key)";
  if (key.split(".").length === 3) return "legacy JWT";
  return "unrecognised";
}

/**
 * Setup self-check: open /api/health in a browser after deploying.
 * Reports which pieces are configured and whether the database answers.
 * Never returns secret values, only whether they are present and well-formed.
 */
export async function GET() {
  const driver = activeDriver();
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = supabaseServerKey();
  const checks: Record<string, Check> = {};

  checks.sessionSecret = sessionSecretOk() ? { ok: true } : fail("SESSION_SECRET_MISSING");
  checks.database =
    driver.kind === "supabase"
      ? key?.startsWith("sb_publishable_")
        ? fail("PUBLISHABLE_KEY_USED")
        : { ok: true, detail: "supabase" }
      : isServerless()
        ? fail("NO_DATABASE_ON_SERVERLESS")
        : { ok: true, detail: "json file (local development only)" };

  if (driver.kind === "supabase" && checks.database.ok) {
    for (const table of TABLES) {
      try {
        // A real GET (not a HEAD request): a missing table must come back as an error body (42P01/PGRST205).
        const { error, status } = await db().from(table).select("*").limit(0);
        if (error) throw new Error(`${error.message} (${error.code ?? status})`);
        checks[`table:${table}`] = { ok: true };
      } catch (err) {
        checks[`table:${table}`] = fail(classifyError(err), err instanceof Error ? err.message.slice(0, 200) : undefined);
      }
    }
  }

  if (Object.values(checks).every((c) => c.ok)) {
    try {
      const s = await store(); // also runs the one-time seed (demo exams + admin)
      checks.seed = { ok: true };
      checks.admin = (await s.hasAdmin())
        ? { ok: true }
        : { ok: false, hint: "কোনো অ্যাডমিন নেই। ADMIN_PHONE আর ADMIN_PASSWORD সেট করে আবার ডিপ্লয় করো।" };
    } catch (err) {
      checks.seed = fail(classifyError(err), err instanceof Error ? err.message.slice(0, 200) : undefined);
    }
  }

  const ok = Object.values(checks).every((c) => c.ok);
  return NextResponse.json(
    {
      ok,
      env: {
        store: driver.kind,
        SUPABASE_URL: url ? hostOf(url) : "missing",
        SUPABASE_SECRET_KEY: keyKind(key),
        SESSION_SECRET: process.env.SESSION_SECRET ? `set (${process.env.SESSION_SECRET.length} chars)` : "missing",
        ADMIN_PHONE: process.env.ADMIN_PHONE ? "set" : "missing",
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? "set" : "missing",
        serverless: isServerless(),
      },
      checks,
    },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
