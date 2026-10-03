import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Attempt, StoredExam, StoredViolation, User } from "@/lib/types";

/**
 * Tiny JSON-file database used by the "json" store driver (store/json.ts)
 * when Supabase isn't configured. Fine for development and a single server;
 * not for serverless hosts (Vercel), whose filesystem doesn't persist.
 */

export interface DbSchema {
  version: 1;
  users: User[];
  exams: StoredExam[];
  attempts: Attempt[];
  violations: StoredViolation[];
}

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const EMPTY: DbSchema = { version: 1, users: [], exams: [], attempts: [], violations: [] };

// Survive Next.js dev hot reloads: keep one cache + one write queue per process.
const g = globalThis as unknown as {
  __stDb?: { data: DbSchema | null; queue: Promise<unknown> };
};
const state = (g.__stDb ??= { data: null, queue: Promise.resolve() });

async function load(): Promise<DbSchema> {
  if (state.data) return state.data;
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    state.data = { ...EMPTY, ...(JSON.parse(raw) as Partial<DbSchema>) } as DbSchema;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    state.data = structuredClone(EMPTY);
  }
  return state.data;
}

async function persist(data: DbSchema) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, DB_FILE); // atomic replace: a crash never leaves half a file
}

/** Read-only snapshot. Do not mutate the returned object. */
export async function readDb(): Promise<DbSchema> {
  await state.queue;
  return load();
}

/**
 * Serialised read-modify-write. Mutations run one at a time, so two requests
 * can never overwrite each other's changes.
 */
export function mutateDb<T>(fn: (db: DbSchema) => T | Promise<T>): Promise<T> {
  const run = state.queue.then(async () => {
    const db = await load();
    const out = await fn(db);
    await persist(db);
    return out;
  });
  state.queue = run.catch(() => undefined);
  return run;
}
