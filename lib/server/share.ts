import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Share links for results. A result is private until its owner shares it:
 * the public URL carries an HMAC of the attempt id, so only someone who got
 * the link from the owner can open it, and attempt ids alone reveal nothing.
 * Without a real secret in production sharing is off, since a guessable key
 * would make every result public.
 */
function key(): string | undefined {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  return process.env.NODE_ENV === "production" ? undefined : "dev-only-share-secret-change-me-0123456789";
}

export function shareToken(attemptId: string): string | undefined {
  const k = key();
  return k && createHmac("sha256", k).update(`share:${attemptId}`).digest("base64url").slice(0, 22);
}

export function verifyShareToken(attemptId: string, token: string | undefined): boolean {
  const expected = shareToken(attemptId);
  if (!token || !expected) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Public link for a result, or undefined when sharing isn't available. */
export function sharePath(attemptId: string): string | undefined {
  const t = shareToken(attemptId);
  return t && `/share/${attemptId}?t=${t}`;
}
