import "server-only";
import { jsonStore } from "./json";
import { supabaseStore } from "./supabase";
import type { Store } from "./types";
import { ConfigError, isServerless } from "../diagnose";

export type { Store } from "./types";

/** Server key: the new `sb_secret_…` key (SUPABASE_SECRET_KEY) or the legacy service_role JWT. */
export function supabaseServerKey(): string | undefined {
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || undefined;
}

/** Supabase when a project URL and a server key are set, otherwise the local JSON file. */
export function supabaseConfigured(): boolean {
  return Boolean((process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL) && supabaseServerKey());
}

const g = globalThis as unknown as { __stSeed?: Promise<void>; __stWarned?: boolean };

/** The driver the current environment selects, without seeding (used by /api/health). */
export function activeDriver(): Store {
  return supabaseConfigured() ? supabaseStore : jsonStore;
}

/**
 * The active store, seeded once per server process (demo exams + first
 * admin). Await this instead of importing a driver directly.
 */
export async function store(): Promise<Store> {
  const s = activeDriver();
  // Vercel & co. have no persistent disk, but fallback memory/tmp store allows demo access
  if (s.kind === "json" && isServerless() && !g.__stWarned) {
    g.__stWarned = true;
    console.warn(
      "[store] Running on serverless without Supabase configured. Operating with in-memory/temp database. Set SUPABASE_URL and SUPABASE_SECRET_KEY in production to persist all data."
    );
  }
  if (s.kind === "supabase" && supabaseServerKey()?.startsWith("sb_publishable_")) {
    throw new ConfigError("PUBLISHABLE_KEY_USED");
  }
  if (s.kind === "json" && process.env.NODE_ENV === "production" && !g.__stWarned) {
    g.__stWarned = true;
    console.warn("[store] Supabase is not configured; using local JSON/memory store. Set SUPABASE_URL and SUPABASE_SECRET_KEY for production.");
  }
  g.__stSeed ??= import("../seed")
    .then(({ seed }) => seed(s))
    .catch((err) => {
      console.warn("[store] Database seeding skipped or failed (continuing safely):", (err as Error).message);
      return Promise.resolve();
    });
  await g.__stSeed;
  return s;
}
