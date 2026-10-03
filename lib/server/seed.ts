import "server-only";
import { EXAM_BANK } from "@/lib/exams/bank";
import { hashPassword } from "./password";
import { newId } from "./ids";
import type { Store } from "./store/types";

const DEV_ADMIN = { phone: "01700000000", password: "admin12345" };

/**
 * First-run data: the demo exams and an admin account. Safe to run on every
 * start: existing rows are left alone.
 * Admin credentials come from ADMIN_PHONE / ADMIN_PASSWORD. Without them a
 * well-known dev admin is created, but only outside production.
 */
export async function seed(store: Store): Promise<void> {
  const now = Date.now();
  for (const exam of Object.values(EXAM_BANK)) {
    if (!(await store.getExam(exam.id))) {
      await store.insertExam({ ...structuredClone(exam), status: "published", createdAt: now, updatedAt: now });
    }
  }

  if (await store.hasAdmin()) return;
  const envPhone = process.env.ADMIN_PHONE;
  const envPassword = process.env.ADMIN_PASSWORD;
  const creds = envPhone && envPassword ? { phone: envPhone, password: envPassword } : process.env.NODE_ENV === "production" ? null : DEV_ADMIN;
  if (!creds) {
    console.error("[seed] No admin account: set ADMIN_PHONE and ADMIN_PASSWORD and restart.");
    return;
  }
  const res = await store.insertUser({
    id: newId("usr"),
    name: "Admin",
    phone: creds.phone,
    passwordHash: await hashPassword(creds.password),
    role: "admin",
    createdAt: now,
  });
  if (res === "phone-taken") {
    console.error(`[seed] ${creds.phone} already belongs to a student account; no admin was created.`);
  } else if (creds === DEV_ADMIN) {
    console.warn(`[seed] Created dev admin ${DEV_ADMIN.phone} / ${DEV_ADMIN.password}. Set ADMIN_PHONE and ADMIN_PASSWORD for real deployments.`);
  }
}
