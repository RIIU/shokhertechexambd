import "server-only";
import { createClient } from "@supabase/supabase-js";
import { newId } from "./ids";
import { getUser, updateUser } from "./users";
import { enrollUserInExam } from "./enrollments";
import type { PaymentMethod, PaymentRequest, PaymentStatus, PlanType, User } from "@/lib/types";

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

export async function testDbPayments() {
  const client = db();
  if (!client) return { data: null, error: { message: "Supabase client not configured" } };
  return client.from("payments").select("*").limit(1);
}

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

interface PaymentRow {
  id: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  plan_type: PlanType;
  exam_id: string | null;
  exam_title: string | null;
  amount: number;
  method: PaymentMethod;
  sender_phone: string;
  trx_id: string;
  status: PaymentStatus;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  valid_until: string | null;
  notes: string | null;
}

const toPaymentRequest = (r: PaymentRow): PaymentRequest => ({
  id: r.id,
  userId: r.user_id,
  userName: r.user_name,
  userPhone: r.user_phone,
  planType: r.plan_type,
  examId: r.exam_id ?? undefined,
  examTitle: r.exam_title ?? undefined,
  amount: Number(r.amount),
  method: r.method,
  senderPhone: r.sender_phone,
  trxId: r.trx_id,
  status: r.status,
  submittedAt: Date.parse(r.submitted_at),
  reviewedAt: r.reviewed_at ? Date.parse(r.reviewed_at) : undefined,
  reviewedBy: r.reviewed_by ?? undefined,
  validUntil: r.valid_until ? Date.parse(r.valid_until) : undefined,
  notes: r.notes ?? undefined,
});

/** Create a new payment verification request */
export async function createPaymentRequest(input: {
  userId: string;
  userName: string;
  userPhone: string;
  planType: PlanType;
  examId?: string;
  examTitle?: string;
  amount: number;
  method: PaymentMethod;
  senderPhone: string;
  trxId: string;
  validUntil?: number;
  notes?: string;
}): Promise<PaymentRequest> {
  const req: PaymentRequest = {
    id: newId("pay"),
    userId: input.userId,
    userName: input.userName,
    userPhone: input.userPhone,
    planType: input.planType,
    examId: input.examId,
    examTitle: input.examTitle,
    amount: input.amount,
    method: input.method,
    senderPhone: input.senderPhone,
    trxId: input.trxId.trim().toUpperCase(),
    status: "pending",
    submittedAt: Date.now(),
    validUntil: input.validUntil,
    notes: input.notes,
  };

  // 1. Try writing to Supabase payments table
  const client = db();
  if (client) {
    try {
      await client.from("payments").insert({
        id: req.id,
        user_id: req.userId,
        user_name: req.userName,
        user_phone: req.userPhone,
        plan_type: req.planType,
        exam_id: req.examId ?? null,
        exam_title: req.examTitle ?? null,
        amount: req.amount,
        method: req.method,
        sender_phone: req.senderPhone,
        trx_id: req.trxId,
        status: req.status,
        submitted_at: new Date(req.submittedAt).toISOString(),
        valid_until: req.validUntil ? new Date(req.validUntil).toISOString() : null,
        notes: req.notes ?? null,
      });
    } catch {
      // continue to fallback
    }
  }

  // 2. Dual-layer fallback: also store directly on user
  const user = await getUser(input.userId);
  if (user) {
    const current = Array.isArray(user.paymentRequests) ? [...user.paymentRequests] : [];
    current.unshift(req);
    await updateUser(input.userId, {
      subscriptionStatus: "pending",
      paymentRequests: current.slice(0, 10),
      latestPayment: req,
    });
  }

  return req;
}

/** Get the latest payment request for a specific user (and exam if provided) */
export async function getLatestUserPayment(
  userId: string,
  examId?: string,
): Promise<PaymentRequest | null> {
  // 1. Try querying Supabase
  const client = db();
  if (client) {
    try {
      let q = client.from("payments").select("*").eq("user_id", userId);
      if (examId) {
        q = q.or(`plan_type.eq.monthly,exam_id.eq.${examId}`);
      }
      const { data, error } = await q.order("submitted_at", { ascending: false }).limit(1).maybeSingle<PaymentRow>();
      if (!error && data) return toPaymentRequest(data);
    } catch {
      // fallback
    }
  }

  // 2. Dual-layer fallback: check user object
  const user = await getUser(userId);
  if (user?.latestPayment) {
    const pay = user.latestPayment;
    if (!examId || pay.planType === "monthly" || pay.planType === "package" || pay.examId === examId) {
      return pay;
    }
  }
  if (user?.paymentRequests?.length) {
    const pay = user.paymentRequests.find(
      (p) => !examId || p.planType === "monthly" || p.planType === "package" || p.examId === examId,
    );
    if (pay) return pay;
  }

  return null;
}

/** List payment requests for admin verification */
export async function listPaymentRequests(filter?: {
  status?: PaymentStatus;
  limit?: number;
}): Promise<PaymentRequest[]> {
  const client = db();
  if (client) {
    try {
      let q = client.from("payments").select("*");
      if (filter?.status) {
        q = q.eq("status", filter.status);
      }
      const { data, error } = await q.order("submitted_at", { ascending: false }).limit(filter?.limit ?? 100);
      if (!error && data && data.length > 0) {
        return (data as PaymentRow[]).map(toPaymentRequest);
      }
    } catch {
      // fallback
    }
  }

  // Fallback: collect from all users
  const { store } = await import("./store");
  const users = await (await store()).listUsers();
  const all: PaymentRequest[] = [];
  for (const u of users) {
    if (Array.isArray(u.paymentRequests)) {
      all.push(...u.paymentRequests);
    } else if (u.latestPayment) {
      all.push(u.latestPayment);
    }
  }

  // Deduplicate by ID
  const map = new Map<string, PaymentRequest>();
  for (const p of all) {
    if (!map.has(p.id)) map.set(p.id, p);
  }
  const unique = Array.from(map.values());

  const filtered = filter?.status ? unique.filter((p) => p.status === filter.status) : unique;
  return filtered.sort((a, b) => b.submittedAt - a.submittedAt).slice(0, filter?.limit ?? 100);
}

/** Count pending payment requests for badge */
export async function countPendingPayments(): Promise<number> {
  const client = db();
  if (client) {
    try {
      const { count, error } = await client
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      if (!error && count !== null) return count;
    } catch {
      // fallback
    }
  }

  const list = await listPaymentRequests({ status: "pending" });
  return list.length;
}

/** Admin Action: Approve a payment request */
export async function approvePaymentRequest(
  requestId: string,
  adminId: string,
): Promise<{ ok: boolean; error?: string; request?: PaymentRequest }> {
  let req: PaymentRequest | undefined;

  // 1. Find the request in DB
  const client = db();
  if (client) {
    try {
      const { data } = await client.from("payments").select("*").eq("id", requestId).maybeSingle<PaymentRow>();
      if (data) req = toPaymentRequest(data);
    } catch {
      // continue
    }
  }

  if (!req) {
    const all = await listPaymentRequests();
    req = all.find((p) => p.id === requestId);
  }

  if (!req) {
    return { ok: false, error: "পেমেন্ট রিকোয়েস্ট পাওয়া যায়নি।" };
  }

  const now = Date.now();
  const validUntil =
    req.planType === "monthly" || req.planType === "package"
      ? (req.validUntil && req.validUntil > now ? req.validUntil : now + MONTH_MS)
      : undefined;

  // 2. Update status in Supabase payments table
  if (client) {
    try {
      await client.from("payments").update({
        status: "approved",
        reviewed_at: new Date(now).toISOString(),
        reviewed_by: adminId,
        valid_until: validUntil ? new Date(validUntil).toISOString() : null,
      }).eq("id", requestId);
    } catch {
      // continue
    }
  }

  // 3. Grant access to user
  const user = await getUser(req.userId);
  if (user) {
    const currentRequests = (user.paymentRequests ?? []).map((x) =>
      x.id === requestId ? { ...x, status: "approved" as const, reviewedAt: now, validUntil } : x,
    );
    const latest =
      user.latestPayment?.id === requestId
        ? { ...user.latestPayment, status: "approved" as const, reviewedAt: now, validUntil }
        : user.latestPayment;

    const patch: Partial<User> = {
      paymentRequests: currentRequests,
      latestPayment: latest,
    };

    if (req.planType === "monthly" || req.planType === "package") {
      patch.subscriptionStatus = "active";
      patch.subscriptionValidUntil = validUntil;
    } else if (req.examId) {
      const current = user.enrolledExams ?? [];
      if (!current.includes(req.examId)) {
        patch.enrolledExams = [...current, req.examId];
      }
      await enrollUserInExam({
        examId: req.examId,
        userId: user.id,
        amount: req.amount,
        paymentMethod: req.method,
        senderPhone: req.senderPhone,
        trxId: req.trxId,
      });
    }

    await updateUser(user.id, patch);
  }

  return { ok: true, request: { ...req, status: "approved", reviewedAt: now, validUntil } };
}

/** Admin Action: Reject a payment request */
export async function rejectPaymentRequest(
  requestId: string,
  adminId: string,
  notes?: string,
): Promise<{ ok: boolean; error?: string }> {
  const now = Date.now();

  const client = db();
  if (client) {
    try {
      await client.from("payments").update({
        status: "rejected",
        reviewed_at: new Date(now).toISOString(),
        reviewed_by: adminId,
        notes: notes ?? null,
      }).eq("id", requestId);
    } catch {
      // continue
    }
  }

  const all = await listPaymentRequests();
  const req = all.find((p) => p.id === requestId);
  if (req) {
    const user = await getUser(req.userId);
    if (user) {
      const currentRequests = (user.paymentRequests ?? []).map((x) =>
        x.id === requestId ? { ...x, status: "rejected" as const, notes, reviewedAt: now } : x,
      );
      const latest =
        user.latestPayment?.id === requestId
          ? { ...user.latestPayment, status: "rejected" as const, notes, reviewedAt: now }
          : user.latestPayment;

      await updateUser(user.id, {
        subscriptionStatus: "none",
        paymentRequests: currentRequests,
        latestPayment: latest,
      });
    }
  }

  return { ok: true };
}
