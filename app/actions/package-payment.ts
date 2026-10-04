"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/server/auth";
import { createPaymentRequest, approvePaymentRequest } from "@/lib/server/payments";
import { updateUser } from "@/lib/server/users";
import type { PaymentMethod } from "@/lib/types";

export interface PackagePaymentResponse {
  ok: boolean;
  error?: string;
  status?: "approved" | "pending";
}

export async function submitPackagePaymentAction(
  formData: FormData,
): Promise<PackagePaymentResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, error: "অনুগ্রহ করে প্রথমে লগইন বা রেজিস্ট্রেশন করো।" };
  }

  const packageId = String(formData.get("packageId") ?? "").trim();
  const packageName = String(formData.get("packageName") ?? "প্রিপারেশন প্যাকেজ").trim();
  const amount = Number(formData.get("amount") ?? 249);
  const durationDays = Number(formData.get("durationDays") ?? 30);
  const paymentMethod = (String(formData.get("paymentMethod") ?? "bkash")) as PaymentMethod;
  const senderPhone = String(formData.get("senderPhone") ?? "").trim();
  const trxId = String(formData.get("trxId") ?? "").trim();
  const isDemo = String(formData.get("isDemo") ?? "") === "true";

  const validUntil = Date.now() + durationDays * 24 * 60 * 60 * 1000;

  // 1-Click instant test trial unlock for seamless demo testing
  if (isDemo) {
    const demoReq = await createPaymentRequest({
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      planType: "package",
      amount,
      method: "demo",
      senderPhone: user.phone,
      trxId: `DEMO_PKG_${Date.now()}`,
      validUntil,
      notes: `1-Click Demo: ${packageName} (${durationDays} days)`,
    });

    await approvePaymentRequest(demoReq.id, "system-demo");

    await updateUser(user.id, {
      subscriptionStatus: "active",
      subscriptionValidUntil: validUntil,
    });

    revalidatePath("/");
    revalidatePath("/dashboard");
    revalidatePath("/profile");

    return { ok: true, status: "approved" };
  }

  // Real payment validation
  if (!senderPhone || senderPhone.length < 11) {
    return { ok: false, error: "সঠিক ১১ ডিজিটের মোবাইল নম্বর দাও (01XXXXXXXXX)।" };
  }
  if (!trxId || trxId.length < 4) {
    return { ok: false, error: "সঠিক ট্রানজেকশন আইডি (TrxID) দাও।" };
  }

  await createPaymentRequest({
    userId: user.id,
    userName: user.name,
    userPhone: user.phone,
    planType: "package",
    amount,
    method: paymentMethod,
    senderPhone,
    trxId,
    validUntil,
    notes: `Package: ${packageName} (${durationDays} days)`,
  });

  revalidatePath("/");
  revalidatePath("/dashboard");

  return { ok: true, status: "pending" };
}
