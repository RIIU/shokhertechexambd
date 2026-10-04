"use server";

import { getCurrentUser } from "@/lib/server/auth";
import { changePassword, getUser, updateUser } from "@/lib/server/users";
import { isLevel, isStream } from "@/lib/data/catalog";
import type { Level, PublicUser, StreamId } from "@/lib/types";

export interface ProfileActionState {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  user?: PublicUser;
}

export async function updateProfileAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const current = await getCurrentUser();
  if (!current) {
    return { ok: false, error: "অনুগ্রহ করে প্রথমে লগইন করো।" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim().slice(0, 200);
  const institution = String(formData.get("institution") ?? "").trim().slice(0, 120);
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim();
  const coverUrl = String(formData.get("coverUrl") ?? "").trim();
  const levelRaw = String(formData.get("level") ?? "").trim();
  const streamRaw = String(formData.get("stream") ?? "").trim();

  const fieldErrors: Record<string, string> = {};

  if (!name || name.length < 2 || name.length > 60) {
    fieldErrors.name = "তোমার পুরো নাম লেখো (২-৬০ অক্ষর)।";
  }

  let level: Level | undefined = current.level;
  let stream: StreamId | undefined = current.stream;

  if (current.role === "student") {
    if (levelRaw) {
      if (isLevel(levelRaw)) {
        level = levelRaw;
      } else {
        fieldErrors.level = "সঠিক স্তর বেছে নাও (SSC বা HSC)।";
      }
    }
    if (streamRaw) {
      if (isStream(streamRaw)) {
        stream = streamRaw;
      } else {
        fieldErrors.stream = "সঠিক বিভাগ বেছে নাও (বিজ্ঞান, মানবিক বা ব্যবসায়)।";
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  try {
    const updated = await updateUser(current.id, {
      name,
      bio: bio || undefined,
      institution: institution || undefined,
      avatarUrl: avatarUrl || undefined,
      coverUrl: coverUrl || undefined,
      level,
      stream,
    });

    if (!updated) {
      return { ok: false, error: "প্রোফাইল আপডেট করা যায়নি। আবার চেষ্টা করো।" };
    }

    const { passwordHash: _, ...publicUser } = updated;
    return { ok: true, user: publicUser };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "প্রোফাইল সংরক্ষণে সমস্যা হয়েছে";
    return { ok: false, error: msg };
  }
}

export async function changePasswordAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const current = await getCurrentUser();
  if (!current) {
    return { ok: false, error: "অনুগ্রহ করে প্রথমে লগইন করো।" };
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  const fieldErrors: Record<string, string> = {};

  if (!currentPassword) {
    fieldErrors.currentPassword = "বর্তমান পাসওয়ার্ড দাও।";
  }
  if (!newPassword || newPassword.length < 6) {
    fieldErrors.newPassword = "নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।";
  } else if (newPassword === currentPassword) {
    fieldErrors.newPassword = "নতুন পাসওয়ার্ড বর্তমান পাসওয়ার্ড থেকে ভিন্ন হতে হবে।";
  }
  if (newPassword !== confirmPassword) {
    fieldErrors.confirmPassword = "দুটি নতুন পাসওয়ার্ড মেলেনি।";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  try {
    const res = await changePassword(current.id, currentPassword, newPassword);
    if (res === "wrong-password") {
      return { ok: false, fieldErrors: { currentPassword: "বর্তমান পাসওয়ার্ড ভুল।" } };
    }
    if (res === "not-found") {
      return { ok: false, error: "ব্যবহারকারী পাওয়া যায়নি।" };
    }
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "পাসওয়ার্ড পরিবর্তনে সমস্যা হয়েছে";
    return { ok: false, error: msg };
  }
}
