"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/server/auth";
import { approvePaymentRequest, rejectPaymentRequest } from "@/lib/server/payments";

export async function approvePaymentAction(requestId: string) {
  const admin = await requireAdmin();
  const result = await approvePaymentRequest(requestId, admin.id);
  revalidatePath("/admin/payments");
  revalidatePath("/admin");
  return result;
}

export async function rejectPaymentAction(requestId: string, notes?: string) {
  const admin = await requireAdmin();
  const result = await rejectPaymentRequest(requestId, admin.id, notes);
  revalidatePath("/admin/payments");
  revalidatePath("/admin");
  return result;
}
