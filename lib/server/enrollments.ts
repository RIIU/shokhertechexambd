import "server-only";
import { createClient } from "@supabase/supabase-js";
import { newId } from "./ids";
import { getUser, updateUser } from "./users";
import type { Enrollment, ExamMeta, PaymentMethod, PublicUser } from "@/lib/types";

function db() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    return createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
    });
  } catch {
    return null;
  }
}

/** Check if a candidate can take this exam (Free exams are open to all; Paid exams require enrollment or admin role). */
export async function hasAccessToExam(exam: ExamMeta, user: PublicUser): Promise<boolean> {
  // Free exams are open to all registered users
  if (!exam.isPaid) return true;

  // Admins always have access to all exams
  if (user.role === "admin") return true;

  const fullUser = await getUser(user.id);
  if (!fullUser) return false;

  // 1. Check active monthly subscription
  if (
    fullUser.subscriptionStatus === "active" &&
    fullUser.subscriptionValidUntil &&
    fullUser.subscriptionValidUntil > Date.now()
  ) {
    return true;
  }

  // 2. Check if student has individual exam enrollment
  if (fullUser.enrolledExams?.includes(exam.id)) {
    return true;
  }

  // 3. Try checking Supabase approved payments or enrollments
  const client = db();
  if (client) {
    try {
      const { data: pay } = await client
        .from("payments")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .or(`plan_type.eq.monthly,exam_id.eq.${exam.id}`)
        .limit(1)
        .maybeSingle();

      if (pay) return true;

      const { data: enr } = await client
        .from("enrollments")
        .select("id")
        .eq("exam_id", exam.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (enr) return true;
    } catch {
      // continue
    }
  }

  return false;
}

/** Enroll a user into a paid exam */
export async function enrollUserInExam(input: {
  examId: string;
  userId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  senderPhone?: string;
  trxId?: string;
}): Promise<Enrollment> {
  const enrollment: Enrollment = {
    id: newId("enr"),
    examId: input.examId,
    userId: input.userId,
    amount: input.amount,
    paymentMethod: input.paymentMethod,
    senderPhone: input.senderPhone,
    trxId: input.trxId,
    createdAt: Date.now(),
  };

  // 1. Try persisting in Supabase enrollments table
  const client = db();
  if (client) {
    try {
      await client.from("enrollments").upsert(
        {
          id: enrollment.id,
          exam_id: enrollment.examId,
          user_id: enrollment.userId,
          amount: enrollment.amount,
          payment_method: enrollment.paymentMethod,
          sender_phone: enrollment.senderPhone ?? null,
          trx_id: enrollment.trxId ?? null,
          created_at: new Date(enrollment.createdAt).toISOString(),
        },
        { onConflict: "exam_id,user_id" },
      );
    } catch {
      // continue to fallback
    }
  }

  // 2. Dual-layer fallback: also store on user object so access works immediately
  const fullUser = await getUser(input.userId);
  if (fullUser) {
    const current = fullUser.enrolledExams ?? [];
    if (!current.includes(input.examId)) {
      await updateUser(input.userId, {
        enrolledExams: [...current, input.examId],
      });
    }
  }

  return enrollment;
}
