import { SignJWT, jwtVerify } from "jose";
import type { Session } from "@/lib/types";

/**
 * Session token helpers. Edge-safe (no Node APIs) so middleware can use them.
 */

export const SESSION_COOKIE = "st_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

const DEV_SECRET = "dev-only-insecure-secret-change-me-0123456789";

let warnedSecret = false;

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production" && !warnedSecret) {
      warnedSecret = true;
      console.warn(
        "[auth] SESSION_SECRET is not set (32+ characters) in environment variables! Using fallback secret. Please set SESSION_SECRET in production settings."
      );
    }
    return new TextEncoder().encode(DEV_SECRET);
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(session: Session): Promise<string> {
  return new SignJWT({ role: session.role, name: session.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (!payload.sub || (payload.role !== "student" && payload.role !== "admin")) return null;
    return { userId: payload.sub, role: payload.role, name: String(payload.name ?? "") };
  } catch {
    return null;
  }
}
