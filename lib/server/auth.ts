import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "@/lib/session-token";
import { getUser, toPublicUser } from "./users";
import type { PublicUser, User } from "@/lib/types";

/**
 * The signed cookie only proves who the user *was*; every call re-reads the
 * user so role changes and blocks take effect immediately.
 */
export async function getCurrentUser(): Promise<PublicUser | null> {
  const session = await verifySession(cookies().get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await getUser(session.userId);
  if (!user || user.blocked) return null;
  return toPublicUser(user);
}

export async function requireUser(nextPath = "/dashboard"): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

export async function requireAdmin(): Promise<PublicUser> {
  const user = await requireUser("/admin");
  if (user.role !== "admin") redirect("/dashboard");
  return user;
}

export async function startSession(user: User): Promise<void> {
  const token = await signSession({ userId: user.id, role: user.role, name: user.name });
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function endSession(): void {
  cookies().delete(SESSION_COOKIE);
}
