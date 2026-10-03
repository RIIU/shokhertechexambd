import "server-only";
import { jsonStore } from "./json";
import { supabaseStore } from "./supabase";
import type { Store } from "./types";

export type { Store } from "./types";

/** Supabase when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set, otherwise the local JSON file. */
export function supabaseConfigured(): boolean {
  return Boolean((process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL) && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

const g = globalThis as unknown as { __stSeed?: Promise<void>; __stWarned?: boolean };

/**
 * The active store, seeded once per server process (demo exams + first
 * admin). Await this instead of importing a driver directly.
 */
export async function store(): Promise<Store> {
  const s = supabaseConfigured() ? supabaseStore : jsonStore;
  if (s.kind === "json" && process.env.NODE_ENV === "production" && !g.__stWarned) {
    g.__stWarned = true;
    console.warn("[store] Supabase is not configured; using the local JSON file. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for production.");
  }
  g.__stSeed ??= import("../seed")
    .then(({ seed }) => seed(s))
    .catch((err) => {
      g.__stSeed = undefined; // retry on the next request (e.g. database briefly unreachable)
      throw err;
    });
  await g.__stSeed;
  return s;
}
