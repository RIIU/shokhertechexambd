import "server-only";

/**
 * Turns setup/infra failures into a short code + Bangla hint, for the
 * auth forms and /api/health. Never includes secrets.
 */
export type ProblemCode =
  | "NO_DATABASE_ON_SERVERLESS"
  | "SESSION_SECRET_MISSING"
  | "PUBLISHABLE_KEY_USED"
  | "TABLES_MISSING"
  | "INVALID_KEY"
  | "SUPABASE_UNREACHABLE"
  | "READONLY_FILESYSTEM"
  | "UNKNOWN";

export const PROBLEM_HINTS: Record<ProblemCode, string> = {
  NO_DATABASE_ON_SERVERLESS:
    "Supabase সেট করা নেই। Vercel-এ SUPABASE_URL আর SUPABASE_SECRET_KEY বসিয়ে আবার ডিপ্লয় করো।",
  SESSION_SECRET_MISSING: "SESSION_SECRET সেট করা নেই (৩২+ অক্ষর লাগবে)। এনভায়রনমেন্ট ভেরিয়েবলে বসিয়ে আবার চালু/ডিপ্লয় করো।",
  PUBLISHABLE_KEY_USED: "SUPABASE_SECRET_KEY-তে publishable key দেওয়া হয়েছে। Supabase → API Keys থেকে sb_secret_… key দাও।",
  TABLES_MISSING:
    "Supabase-এ টেবিল তৈরি হয়নি। SQL Editor-এ supabase/setup.sql ফাইলের পুরোটা Run করো।",
  INVALID_KEY: "Supabase key ভুল বা বাতিল। Supabase → Project Settings → API Keys থেকে সঠিক secret key দাও।",
  SUPABASE_UNREACHABLE: "Supabase-এ সংযোগ হচ্ছে না। SUPABASE_URL ঠিক আছে কিনা দেখো (https://xxxx.supabase.co), আর প্রজেক্ট pause হয়ে আছে কিনা।",
  READONLY_FILESYSTEM: "সার্ভারে ফাইল লেখা যাচ্ছে না। Supabase সেট করো (SUPABASE_URL + SUPABASE_SECRET_KEY)।",
  UNKNOWN: "সার্ভারে অপ্রত্যাশিত সমস্যা হয়েছে। সার্ভারের লগ দেখো।",
};

/** Marker for errors the app throws itself on purpose. */
export class ConfigError extends Error {
  constructor(public code: ProblemCode) {
    super(`[config] ${code}: ${PROBLEM_HINTS[code]}`);
  }
}

export function classifyError(err: unknown): ProblemCode {
  if (err instanceof ConfigError) return err.code;
  const msg = err instanceof Error ? `${err.message} ${(err as { cause?: { code?: string } }).cause?.code ?? ""}` : String(err);
  if (/SESSION_SECRET/.test(msg)) return "SESSION_SECRET_MISSING";
  if (/publishable/i.test(msg)) return "PUBLISHABLE_KEY_USED";
  if (/PGRST205|42P01|does not exist|schema cache/i.test(msg)) return "TABLES_MISSING";
  if (/Invalid API key|No API key|Unregistered API key|JWT|JWS|PGRST30[0-3]|401|unauthori[sz]ed|permission denied|42501/i.test(msg)) return "INVALID_KEY";
  if (/fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|getaddrinfo|Invalid URL|SUPABASE_URL/i.test(msg)) return "SUPABASE_UNREACHABLE";
  if (/EROFS|EACCES|read-only file system/i.test(msg)) return "READONLY_FILESYSTEM";
  return "UNKNOWN";
}

/** Message shown on forms: what went wrong, in Bangla, plus a code to search the logs for. */
export function userFacingError(err: unknown, where: string): string {
  const code = classifyError(err);
  console.error(`[${where}] ${code}`, err);
  return `দুঃখিত, সার্ভারে সমস্যা হয়েছে (${code})। ${PROBLEM_HINTS[code]}`;
}

export function sessionSecretOk(): boolean {
  const s = process.env.SESSION_SECRET;
  return process.env.NODE_ENV !== "production" || Boolean(s && s.length >= 32);
}

/** Hosts whose filesystem doesn't persist, so the JSON fallback can't work there. */
export function isServerless(): boolean {
  return Boolean(process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
}
