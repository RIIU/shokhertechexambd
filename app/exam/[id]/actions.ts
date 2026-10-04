"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/server/auth";
import { getExam, getPublishedExam } from "@/lib/server/exams";
import { createPaymentRequest } from "@/lib/server/payments";
import { enrollUserInExam } from "@/lib/server/enrollments";
import type { PaymentMethod, PlanType } from "@/lib/types";

export async function submitPaymentRequestAction(
  formData: FormData,
): Promise<{ ok: boolean; error?: string; status?: "approved" | "pending" }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "অনুগ্রহ করে প্রথমে লগইন করো।" };

  const examId = String(formData.get("examId") ?? "");
  const planType = (String(formData.get("planType") ?? "exam")) as PlanType;
  const paymentMethod = (String(formData.get("paymentMethod") ?? "bkash")) as PaymentMethod;
  const senderPhone = String(formData.get("senderPhone") ?? "").trim();
  const trxId = String(formData.get("trxId") ?? "").trim();
  const isDemo = String(formData.get("isDemo") ?? "") === "true";

  const exam = user.role === "admin" ? await getExam(examId) : await getPublishedExam(examId);
  if (!exam) return { ok: false, error: "পরীক্ষাটি খুঁজে পাওয়া যায়নি।" };

  // 1-Click instant test unlock for instant trial
  if (isDemo) {
    await enrollUserInExam({
      examId: exam.id,
      userId: user.id,
      amount: exam.price ?? 50,
      paymentMethod: "demo",
      senderPhone: user.phone,
      trxId: `DEMO_${Date.now()}`,
    });
    revalidatePath(`/exam/${examId}`);
    return { ok: true, status: "approved" };
  }

  // Validation
  if (!senderPhone || senderPhone.length < 11) {
    return { ok: false, error: "সঠিক ১১ ডিজিটের মোবাইল নম্বর দাও (01XXXXXXXXX)।" };
  }
  if (!trxId || trxId.length < 4) {
    return { ok: false, error: "সঠিক ট্রানজেকশন আইডি (TrxID) দাও।" };
  }

  const amount = planType === "monthly" ? 299 : (exam.price ?? 50);

  await createPaymentRequest({
    userId: user.id,
    userName: user.name,
    userPhone: user.phone,
    planType,
    examId: planType === "exam" ? exam.id : undefined,
    examTitle: planType === "exam" ? exam.titleBn : undefined,
    amount,
    method: paymentMethod,
    senderPhone,
    trxId,
  });

  revalidatePath(`/exam/${examId}`);
  return { ok: true, status: "pending" };
}

/** Backward compatible wrapper */
export async function enrollExamAction(formData: FormData) {
  return submitPaymentRequestAction(formData);
}
