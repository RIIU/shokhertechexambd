import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { EXAM_BANK } from "@/lib/exams/bank";
import type { Attempt, StoredExam, StoredViolation, User } from "@/lib/types";

/**
 * Tiny JSON-file database used by the "json" store driver (store/json.ts)
 * when Supabase isn't configured. Fine for development and a single server;
 * on serverless (Vercel) writes to /tmp or operates in memory with default exams.
 */

export interface DbSchema {
  version: 1;
  users: User[];
  exams: StoredExam[];
  attempts: Attempt[];
  violations: StoredViolation[];
}

const isServerlessHost = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
const DATA_DIR = process.env.DATA_DIR ?? (isServerlessHost ? path.join(os.tmpdir(), "shokhertech-data") : path.join(process.cwd(), ".data"));
const DB_FILE = path.join(DATA_DIR, "db.json");

function getDefaultExams(): StoredExam[] {
  const now = 1700000000000;
  return Object.values(EXAM_BANK).map((e) => ({
    ...structuredClone(e),
    status: "published" as const,
    createdAt: now,
    updatedAt: now,
  }));
}

const EMPTY: DbSchema = { version: 1, users: [], exams: getDefaultExams(), attempts: [], violations: [] };

// Survive Next.js dev hot reloads: keep one cache + one write queue per process.
const g = globalThis as unknown as {
  __stDb?: { data: DbSchema | null; queue: Promise<unknown> };
};
const state = (g.__stDb ??= { data: null, queue: Promise.resolve() });

async function load(): Promise<DbSchema> {
  if (state.data) return state.data;
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<DbSchema>;
    state.data = {
      ...EMPTY,
      ...parsed,
      exams: parsed.exams && parsed.exams.length > 0 ? parsed.exams : getDefaultExams(),
    } as DbSchema;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn("[db] Could not read db file, initializing with defaults:", (err as Error).message);
    }
    state.data = structuredClone(EMPTY);
  }
  return state.data;
}

async function persist(data: DbSchema) {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${DB_FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
    await fs.rename(tmp, DB_FILE); // atomic replace
  } catch (err) {
    // If the environment filesystem is completely read-only, log once and keep state in memory
    console.warn("[db] Cannot write to filesystem; continuing in-memory:", (err as Error).message);
  }
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
