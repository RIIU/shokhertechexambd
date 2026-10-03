"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { endSession, startSession } from "@/lib/server/auth";
import { createStudent, findUserByPhone } from "@/lib/server/users";
import { dummyHash, verifyPassword } from "@/lib/server/password";
import { normalizePhone } from "@/lib/phone";
import { isLevel, isStream } from "@/lib/data/catalog";

export interface AuthFormState {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
}

/** Only allow same-site relative redirects (no "//evil.com"). */
function safeNext(next: FormDataEntryValue | null, fallback: string): string {
  const value = typeof next === "string" ? next : "";
  return value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

/* ----------------------------- Rate limiting ----------------------------- */
// In-memory, per process: 8 failed logins per phone+IP per 10 minutes.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILS = 8;
const g = globalThis as unknown as { __stLoginFails?: Map<string, number[]> };
const fails = (g.__stLoginFails ??= new Map<string, number[]>());

function tooManyAttempts(key: string): boolean {
  const now = Date.now();
  const recent = (fails.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  fails.set(key, recent);
  return recent.length >= MAX_FAILS;
}
function noteFailure(key: string) {
  fails.set(key, [...(fails.get(key) ?? []), Date.now()]);
}

/* -------------------------------- Actions -------------------------------- */

export async function loginAction(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  const phone = normalizePhone(String(form.get("phone") ?? ""));
  const password = String(form.get("password") ?? "");
  if (!phone) return { fieldErrors: { phone: "সঠিক মোবাইল নম্বর দাও (01XXXXXXXXX)" } };
  if (!password) return { fieldErrors: { password: "পাসওয়ার্ড দাও" } };

  const ip = headers().get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const key = `${phone}|${ip}`;
  if (tooManyAttempts(key)) return { error: "অনেকবার ভুল চেষ্টা হয়েছে। ১০ মিনিট পর আবার চেষ্টা করো।" };

  const user = await findUserByPhone(phone);
  // Verify even when the user is missing, so response time doesn't reveal which numbers exist.
  const ok = await verifyPassword(password, user?.passwordHash ?? (await dummyHash()));
  if (!user || !ok) {
    noteFailure(key);
    return { error: "মোবাইল নম্বর বা পাসওয়ার্ড ভুল।" };
  }
  if (user.blocked) return { error: "তোমার অ্যাকাউন্ট বন্ধ রাখা হয়েছে। অ্যাডমিনের সাথে যোগাযোগ করো।" };

  fails.delete(key);
  await startSession(user);
  redirect(safeNext(form.get("next"), user.role === "admin" ? "/admin" : "/dashboard"));
}

export async function registerAction(_prev: AuthFormState, form: FormData): Promise<AuthFormState> {
  const name = String(form.get("name") ?? "").trim();
  const phone = normalizePhone(String(form.get("phone") ?? ""));
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  const level = String(form.get("level") ?? "");
  const stream = String(form.get("stream") ?? "");
  const institution = String(form.get("institution") ?? "").trim().slice(0, 120);

  const fieldErrors: AuthFormState["fieldErrors"] = {};
  if (name.length < 2 || name.length > 60) fieldErrors.name = "তোমার পুরো নাম লেখো";
  if (!phone) fieldErrors.phone = "সঠিক মোবাইল নম্বর দাও (01XXXXXXXXX)";
  if (password.length < 6) fieldErrors.password = "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে";
  else if (password !== confirm) fieldErrors.confirm = "দুটি পাসওয়ার্ড মেলেনি";
  if (!isLevel(level)) fieldErrors.level = "স্তর বেছে নাও";
  if (!isStream(stream)) fieldErrors.stream = "বিভাগ বেছে নাও";
  if (Object.keys(fieldErrors).length || !phone || !isLevel(level) || !isStream(stream)) return { fieldErrors };

  const user = await createStudent({ name, phone, password, level, stream, institution });
  if (user === "phone-taken") return { fieldErrors: { phone: "এই নম্বরে আগেই অ্যাকাউন্ট আছে। লগইন করো।" } };

  await startSession(user);
  redirect(safeNext(form.get("next"), "/dashboard"));
}

export async function logoutAction(): Promise<void> {
  endSession();
  redirect("/");
}
