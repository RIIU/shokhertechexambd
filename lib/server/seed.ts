import "server-only";
import { EXAM_BANK } from "@/lib/exams/bank";
import { hashPassword } from "./password";
import { newId, type DbSchema } from "./db";

const DEV_ADMIN = { phone: "01700000000", password: "admin12345" };

/**
 * First-run data: the demo exams and an admin account.
 * Admin credentials come from ADMIN_PHONE / ADMIN_PASSWORD. Without them a
 * well-known dev admin is created, but only outside production.
 * Returns true when it changed the database.
 */
export async function seed(db: DbSchema): Promise<boolean> {
  let changed = false;
  const now = Date.now();

  for (const exam of Object.values(EXAM_BANK)) {
    if (!db.exams.some((e) => e.id === exam.id)) {
      db.exams.push({ ...structuredClone(exam), status: "published", createdAt: now, updatedAt: now });
      changed = true;
    }
  }

  const envPhone = process.env.ADMIN_PHONE;
  const envPassword = process.env.ADMIN_PASSWORD;
  const isProd = process.env.NODE_ENV === "production";

  if (!db.users.some((u) => u.role === "admin")) {
    const creds = envPhone && envPassword ? { phone: envPhone, password: envPassword } : isProd ? null : DEV_ADMIN;
    if (creds) {
      db.users.push({
        id: newId("usr"),
        name: "Admin",
        phone: creds.phone,
        passwordHash: await hashPassword(creds.password),
        role: "admin",
        createdAt: now,
      });
      changed = true;
      if (creds === DEV_ADMIN) {
        console.warn(`[seed] Created dev admin ${DEV_ADMIN.phone} / ${DEV_ADMIN.password}. Set ADMIN_PHONE and ADMIN_PASSWORD for real deployments.`);
      }
    } else {
      console.error("[seed] No admin account: set ADMIN_PHONE and ADMIN_PASSWORD and restart.");
    }
  }

  return changed;
}
