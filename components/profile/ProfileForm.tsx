"use client";

import { useId, useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  Camera,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Image as ImageIcon,
  KeyRound,
  Lock,
  RotateCcw,
  School,
  ShieldCheck,
  Sparkles,
  Upload,
  User as UserIcon,
  X,
} from "lucide-react";
import { useAppShell } from "@/components/layout/AppShell";
import { updateProfileAction, changePasswordAction } from "@/app/profile/actions";
import { PRESET_AVATARS, PRESET_COVERS } from "@/lib/profile-presets";
import { compressImageFile } from "@/lib/image-compress";
import { LEVELS, STREAMS, STREAM_IDS } from "@/lib/data/catalog";
import { formatPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";
import type { Level, PublicUser, StreamId } from "@/lib/types";

interface ProfileFormProps {
  initialUser: PublicUser;
}

export function ProfileForm({ initialUser }: ProfileFormProps) {
  const { refreshUser } = useAppShell();
  const [isPending, startTransition] = useTransition();

  // Form State
  const [name, setName] = useState(initialUser.name);
  const [bio, setBio] = useState(initialUser.bio ?? "");
  const [institution, setInstitution] = useState(initialUser.institution ?? "");
  const [level, setLevel] = useState<Level>(initialUser.level ?? "hsc");
  const [stream, setStream] = useState<StreamId>(initialUser.stream ?? "science");
  const [avatarUrl, setAvatarUrl] = useState(initialUser.avatarUrl ?? "");
  const [coverUrl, setCoverUrl] = useState(initialUser.coverUrl ?? "");

  // Modals for image selection
  const [coverModalOpen, setCoverModalOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [customCoverUrl, setCustomCoverUrl] = useState("");
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [imageCompressing, setImageCompressing] = useState(false);

  // Status feedback
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Password change state
  const [pwdCurrent, setPwdCurrent] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [pwdFeedback, setPwdFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});
  const [isPwdPending, startPwdTransition] = useTransition();

  const coverFileRef = useRef<HTMLInputElement>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  // Handle Cover File Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImageCompressing(true);
      const compressed = await compressImageFile(file, { maxWidth: 900, maxHeight: 300, quality: 0.85 });
      setCoverUrl(compressed);
      setCoverModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "ছবি প্রসেস করতে ব্যর্থ হয়েছে");
    } finally {
      setImageCompressing(false);
      if (coverFileRef.current) coverFileRef.current.value = "";
    }
  };

  // Handle Avatar File Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImageCompressing(true);
      const compressed = await compressImageFile(file, { maxWidth: 280, maxHeight: 280, quality: 0.88, squareCrop: true });
      setAvatarUrl(compressed);
      setAvatarModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "ছবি প্রসেস করতে ব্যর্থ হয়েছে");
    } finally {
      setImageCompressing(false);
      if (avatarFileRef.current) avatarFileRef.current.value = "";
    }
  };

  // Submit Profile Information
  const handleSubmitProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setFieldErrors({});

    const formData = new FormData();
    formData.append("name", name);
    formData.append("bio", bio);
    formData.append("institution", institution);
    formData.append("avatarUrl", avatarUrl);
    formData.append("coverUrl", coverUrl);
    if (initialUser.role === "student") {
      formData.append("level", level);
      formData.append("stream", stream);
    }

    startTransition(async () => {
      const res = await updateProfileAction({ ok: false }, formData);
      if (res.ok) {
        setFeedback({ type: "success", message: "প্রোফাইল সফলভাবে আপডেট হয়েছে!" });
        await refreshUser();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        if (res.fieldErrors) setFieldErrors(res.fieldErrors);
        setFeedback({ type: "error", message: res.error ?? "তথ্য যাচাই করে আবার চেষ্টা করো।" });
      }
    });
  };

  // Submit Password Change
  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdFeedback(null);
    setPwdErrors({});

    const formData = new FormData();
    formData.append("currentPassword", pwdCurrent);
    formData.append("newPassword", pwdNew);
    formData.append("confirmPassword", pwdConfirm);

    startPwdTransition(async () => {
      const res = await changePasswordAction({ ok: false }, formData);
      if (res.ok) {
        setPwdFeedback({ type: "success", message: "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!" });
        setPwdCurrent("");
        setPwdNew("");
        setPwdConfirm("");
      } else {
        if (res.fieldErrors) setPwdErrors(res.fieldErrors);
        setPwdFeedback({ type: "error", message: res.error ?? "পাসওয়ার্ড যাচাই করে আবার চেষ্টা করো।" });
      }
    });
  };

  const defaultCoverGradient = "bg-gradient-to-r from-obsidian-950 via-forest to-obsidian-900";

  return (
    <div className="space-y-8">
      {/* Hidden file inputs */}
      <input ref={coverFileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
      <input ref={avatarFileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

      {/* Main Profile Card with Cover and Avatar */}
      <div className="overflow-hidden rounded-3xl border border-surface-border bg-obsidian-900 shadow-2xl">
        {/* Cover Photo Header */}
        <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-obsidian-950">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt="Profile Cover"
              className="h-full w-full object-cover object-center transition-all duration-300"
            />
          ) : (
            <div className={cn("h-full w-full flex items-center justify-center", defaultCoverGradient)}>
              <div className="pointer-events-none absolute inset-0 bg-radial-brand opacity-30" />
              <div className="text-center">
                <Sparkles className="mx-auto h-8 w-8 text-brand-400/40" />
                <span lang="bn" className="text-xs text-ink-subtle">
                  কভার ছবি যুক্ত করো
                </span>
              </div>
            </div>
          )}

          {/* Cover gradient shadow at bottom */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-obsidian-900 via-obsidian-900/60 to-transparent" />

          {/* Change Cover Button */}
          <button
            type="button"
            onClick={() => setCoverModalOpen(true)}
            className="absolute right-4 top-4 flex items-center gap-2 rounded-xl border border-white/20 bg-obsidian-900/80 px-3.5 py-2 text-xs font-semibold text-ink backdrop-blur-md transition-all hover:bg-obsidian-900 hover:border-brand-400"
          >
            <ImageIcon className="h-4 w-4 text-brand-400" />
            <span lang="bn">কভার পরিবর্তন</span>
          </button>
        </div>

        {/* Profile Avatar & Header Row */}
        <div className="relative px-6 pb-6 pt-0 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            {/* Avatar overlapping cover */}
            <div className="flex items-end gap-5">
              <div className="relative -mt-16 sm:-mt-20 group">
                <div className="relative h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-full border-4 border-obsidian-900 bg-obsidian-800 shadow-2xl ring-2 ring-brand-400/30">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="h-full w-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-forest font-display text-4xl sm:text-5xl font-bold text-brand-300">
                      {name.trim().charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Camera Edit Badge */}
                <button
                  type="button"
                  onClick={() => setAvatarModalOpen(true)}
                  aria-label="Change profile photo"
                  className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-brand-400 text-forest shadow-glow transition-transform hover:scale-110 active:scale-95 ring-2 ring-obsidian-900"
                  title="ছবি পরিবর্তন করো"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>

              {/* User details header text */}
              <div className="space-y-1 pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 lang="bn" className="text-2xl font-bold text-ink sm:text-3xl">
                    {name || initialUser.name}
                  </h2>
                  {initialUser.role === "admin" ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-400/15 px-2.5 py-0.5 text-xs font-semibold text-brand-300 ring-1 ring-brand-400/30">
                      <ShieldCheck className="h-3.5 w-3.5" /> Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-400/15 px-2.5 py-0.5 text-xs font-semibold text-teal-300 ring-1 ring-teal-400/30">
                      <GraduationCap className="h-3.5 w-3.5" /> Student
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    সক্রিয়
                  </span>
                </div>
                <p className="font-mono text-xs text-ink-subtle">{formatPhone(initialUser.phone)}</p>
                {bio && (
                  <p lang="bn" className="max-w-xl text-sm text-ink-muted italic">
                    &ldquo;{bio}&rdquo;
                  </p>
                )}
              </div>
            </div>

            {/* Quick stats or action badge */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="chip text-xs">
                <span lang="bn">
                  {initialUser.role === "admin"
                    ? "সিস্টেম অ্যাডমিনিস্ট্রেটর"
                    : `${LEVELS[level]?.nameBn || "HSC"} · ${STREAMS[stream]?.nameBn || "বিজ্ঞান"}`}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Alert Feedback */}
      {feedback && (
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl p-4 text-sm font-medium transition-all",
            feedback.type === "success"
              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border border-rose-500/30 bg-rose-500/10 text-rose-300",
          )}
        >
          {feedback.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <X className="h-5 w-5 shrink-0" />}
          <span lang="bn">{feedback.message}</span>
        </div>
      )}

      {/* Profile Details Edit Form */}
      <div className="rounded-3xl border border-surface-border bg-obsidian-900 p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-surface-border pb-4">
          <div>
            <h3 lang="bn" className="text-lg font-bold text-ink">
              ব্যক্তিগত তথ্য ও প্রোফাইল এডিট
            </h3>
            <p lang="bn" className="text-xs text-ink-subtle">
              তোমার নাম, প্রতিষ্ঠান, বায়ো এবং পরীক্ষার বিভাগ নির্ধারণ করো
            </p>
          </div>
          <span className="rounded-xl bg-brand-400/10 p-2 text-brand-400">
            <UserIcon className="h-5 w-5" />
          </span>
        </div>

        <form onSubmit={handleSubmitProfile} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Full Name */}
            <div>
              <label htmlFor="profile-name" className="field-label" lang="bn">
                তোমার পুরো নাম *
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={60}
                className="field"
                placeholder="যেমন: আরিয়ান আহমেদ"
              />
              {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
            </div>

            {/* Mobile Number (Read-only) */}
            <div>
              <label className="field-label" lang="bn">
                মোবাইল নম্বর (লগইন আইডি)
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  disabled
                  value={formatPhone(initialUser.phone)}
                  className="field cursor-not-allowed bg-obsidian-950 font-mono text-ink-muted opacity-80"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-emerald-400">
                  যাচাইকৃত
                </span>
              </div>
              <p lang="bn" className="mt-1 text-[11px] text-ink-subtle">
                মোবাইল নম্বর পরিবর্তন করতে সাপোর্ট টিমে যোগাযোগ করো।
              </p>
            </div>
          </div>

          {/* Bio / Status */}
          <div>
            <label htmlFor="profile-bio" className="field-label" lang="bn">
              বায়ো / স্ট্যাটাস (সংক্ষিপ্ত বার্তা)
            </label>
            <input
              id="profile-bio"
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={200}
              className="field"
              placeholder="যেমন: HSC 2026 পরীক্ষার্থী | লক্ষ্য বুয়েট বা ঢাকা মেডিকেল 🎯"
            />
            <p className="mt-1 text-right text-[11px] text-ink-subtle">{bio.length}/২০০ অক্ষর</p>
          </div>

          {/* Institution */}
          <div>
            <label htmlFor="profile-inst" className="field-label" lang="bn">
              শিক্ষাপ্রতিষ্ঠান (কলেজ বা স্কুলের নাম)
            </label>
            <div className="relative">
              <School className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
              <input
                id="profile-inst"
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                maxLength={120}
                className="field pl-10"
                placeholder="যেমন: নটর ডেম কলেজ, ঢাকা"
              />
            </div>
          </div>

          {/* Student Specific Fields: Level & Stream */}
          {initialUser.role === "student" && (
            <div className="rounded-2xl border border-surface-border bg-obsidian-950/60 p-5 space-y-4">
              <h4 lang="bn" className="text-sm font-semibold text-ink">
                পরীক্ষার স্তর ও বিভাগ (Catalog Settings)
              </h4>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Level selector */}
                <div>
                  <label className="field-label text-xs text-ink-subtle" lang="bn">
                    পরীক্ষার স্তর (Level)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["ssc", "hsc"] as const).map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLevel(l)}
                        className={cn(
                          "rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition-all",
                          level === l
                            ? "border-brand-400 bg-brand-400/15 text-brand-300 shadow-glow"
                            : "border-surface-border bg-obsidian-900 text-ink-muted hover:border-ink-muted",
                        )}
                      >
                        <span lang="bn">{LEVELS[l].nameBn}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stream selector */}
                <div>
                  <label className="field-label text-xs text-ink-subtle" lang="bn">
                    বিভাগ (Stream)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {STREAM_IDS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStream(s)}
                        className={cn(
                          "rounded-xl border px-2.5 py-2.5 text-center text-xs font-semibold transition-all",
                          stream === s
                            ? "border-teal-400 bg-teal-400/15 text-teal-300"
                            : "border-surface-border bg-obsidian-900 text-ink-muted hover:border-ink-muted",
                        )}
                      >
                        <span lang="bn">{STREAMS[s].nameBn}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isPending || imageCompressing}
              className="btn-primary min-w-[180px]"
            >
              {isPending ? (
                <span lang="bn">সংরক্ষণ হচ্ছে...</span>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span lang="bn">পরিবর্তন সংরক্ষণ করো</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Change Card */}
      <div className="rounded-3xl border border-surface-border bg-obsidian-900 p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-surface-border pb-4">
          <div>
            <h3 lang="bn" className="text-lg font-bold text-ink">
              নিরাপত্তা ও পাসওয়ার্ড পরিবর্তন
            </h3>
            <p lang="bn" className="text-xs text-ink-subtle">
              অ্যাকাউন্টের সুরক্ষায় নিয়মিত পাসওয়ার্ড পরিবর্তন করো
            </p>
          </div>
          <span className="rounded-xl bg-amber-400/10 p-2 text-amber-400">
            <KeyRound className="h-5 w-5" />
          </span>
        </div>

        {pwdFeedback && (
          <div
            className={cn(
              "mb-6 flex items-center gap-3 rounded-2xl p-4 text-sm font-medium",
              pwdFeedback.type === "success"
                ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : "border border-rose-500/30 bg-rose-500/10 text-rose-300",
            )}
          >
            {pwdFeedback.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <X className="h-5 w-5 shrink-0" />}
            <span lang="bn">{pwdFeedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmitPassword} className="space-y-5 max-w-xl">
          {/* Current Password */}
          <div>
            <label htmlFor="pwd-current" className="field-label" lang="bn">
              বর্তমান পাসওয়ার্ড *
            </label>
            <div className="relative">
              <input
                id="pwd-current"
                type={showCurrentPass ? "text" : "password"}
                value={pwdCurrent}
                onChange={(e) => setPwdCurrent(e.target.value)}
                required
                className="field pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink"
              >
                {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {pwdErrors.currentPassword && <p className="field-error">{pwdErrors.currentPassword}</p>}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="pwd-new" className="field-label" lang="bn">
              নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর) *
            </label>
            <div className="relative">
              <input
                id="pwd-new"
                type={showNewPass ? "text" : "password"}
                value={pwdNew}
                onChange={(e) => setPwdNew(e.target.value)}
                required
                minLength={6}
                className="field pr-10"
                placeholder="নতুন পাসওয়ার্ড দাও"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-subtle hover:text-ink"
              >
                {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {pwdErrors.newPassword && <p className="field-error">{pwdErrors.newPassword}</p>}
          </div>

          {/* Confirm New Password */}
          <div>
            <label htmlFor="pwd-confirm" className="field-label" lang="bn">
              নতুন পাসওয়ার্ড নিশ্চিত করো *
            </label>
            <input
              id="pwd-confirm"
              type="password"
              value={pwdConfirm}
              onChange={(e) => setPwdConfirm(e.target.value)}
              required
              className="field"
              placeholder="একই নতুন পাসওয়ার্ড আবার লেখো"
            />
            {pwdErrors.confirmPassword && <p className="field-error">{pwdErrors.confirmPassword}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPwdPending}
              className="btn-ghost"
            >
              <Lock className="h-4 w-4" />
              <span lang="bn">{isPwdPending ? "যাচাই হচ্ছে..." : "পাসওয়ার্ড পরিবর্তন করো"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Cover Photo Selection Modal */}
      {coverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-surface-border bg-obsidian-900 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-surface-border pb-3">
              <h3 lang="bn" className="text-lg font-bold text-ink flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-brand-400" />
                কভার ছবি নির্বাচন করো
              </h3>
              <button
                type="button"
                onClick={() => setCoverModalOpen(false)}
                className="rounded-lg p-1.5 text-ink-subtle hover:bg-surface-pill hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Presets Grid */}
            <div className="space-y-4">
              <h4 lang="bn" className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                রেডিমেড কভার প্রিসেটস
              </h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {PRESET_COVERS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setCoverUrl(preset.url);
                      setCoverModalOpen(false);
                    }}
                    className={cn(
                      "group relative h-24 overflow-hidden rounded-2xl border text-left transition-all",
                      coverUrl === preset.url
                        ? "border-brand-400 ring-2 ring-brand-400/50"
                        : "border-surface-border hover:border-brand-400/50",
                    )}
                  >
                    <img src={preset.url} alt={preset.nameEn} className="h-full w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-obsidian-950/90 to-transparent p-2">
                      <p lang="bn" className="truncate text-xs font-semibold text-ink">
                        {preset.nameBn}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Upload Custom Image */}
              <div className="mt-6 border-t border-surface-border pt-4">
                <h4 lang="bn" className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                  তোমার ডিভাইস থেকে কভার আপলোড করো
                </h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => coverFileRef.current?.click()}
                    disabled={imageCompressing}
                    className="btn-primary"
                  >
                    <Upload className="h-4 w-4" />
                    <span lang="bn">{imageCompressing ? "প্রসেস হচ্ছে..." : "ছবি সিলেক্ট করো (PNG/JPG)"}</span>
                  </button>

                  {coverUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setCoverUrl("");
                        setCoverModalOpen(false);
                      }}
                      className="btn-ghost text-rose-300 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-200"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span lang="bn">কভার সরিয়ে নাও</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Or paste Custom URL */}
              <div className="border-t border-surface-border pt-4">
                <label className="field-label text-xs" lang="bn">
                  অথবা ছবির সরাসরি লিংক পেস্ট করো (Image URL):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customCoverUrl}
                    onChange={(e) => setCustomCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="field text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customCoverUrl.trim()) {
                        setCoverUrl(customCoverUrl.trim());
                        setCoverModalOpen(false);
                      }
                    }}
                    className="btn-ghost shrink-0 px-3 text-xs"
                  >
                    সেট করো
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Photo Selection Modal */}
      {avatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian-950/80 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-surface-border bg-obsidian-900 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-surface-border pb-3">
              <h3 lang="bn" className="text-lg font-bold text-ink flex items-center gap-2">
                <Camera className="h-5 w-5 text-brand-400" />
                প্রোফাইল ছবি নির্বাচন করো
              </h3>
              <button
                type="button"
                onClick={() => setAvatarModalOpen(false)}
                className="rounded-lg p-1.5 text-ink-subtle hover:bg-surface-pill hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Avatar Presets Grid */}
            <div className="space-y-4">
              <h4 lang="bn" className="text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                রেডিমেড অ্যাভাটার প্রিসেটস
              </h4>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
                {PRESET_AVATARS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setAvatarUrl(preset.url);
                      setAvatarModalOpen(false);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all",
                      avatarUrl === preset.url
                        ? "border-brand-400 bg-brand-400/10 ring-2 ring-brand-400/50"
                        : "border-surface-border hover:border-brand-400/50 hover:bg-white/[0.02]",
                    )}
                  >
                    <div className="h-16 w-16 overflow-hidden rounded-full ring-2 ring-brand-400/40">
                      <img src={preset.url} alt={preset.nameEn} className="h-full w-full object-cover" />
                    </div>
                    <span lang="bn" className="text-center text-xs font-medium text-ink">
                      {preset.nameBn}
                    </span>
                  </button>
                ))}
              </div>

              {/* Upload Custom Image */}
              <div className="mt-6 border-t border-surface-border pt-4">
                <h4 lang="bn" className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-subtle">
                  তোমার ক্যামেরা বা গ্যালারি থেকে ছবি আপলোড করো
                </h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => avatarFileRef.current?.click()}
                    disabled={imageCompressing}
                    className="btn-primary"
                  >
                    <Upload className="h-4 w-4" />
                    <span lang="bn">{imageCompressing ? "প্রসেস হচ্ছে..." : "ছবি সিলেক্ট করো (PNG/JPG)"}</span>
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarUrl("");
                        setAvatarModalOpen(false);
                      }}
                      className="btn-ghost text-rose-300 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-200"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span lang="bn">ছবি সরিয়ে নাও</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Or paste Custom URL */}
              <div className="border-t border-surface-border pt-4">
                <label className="field-label text-xs" lang="bn">
                  অথবা সরাসরি ইমেজ লিংক (Image URL):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                    className="field text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customAvatarUrl.trim()) {
                        setAvatarUrl(customAvatarUrl.trim());
                        setAvatarModalOpen(false);
                      }
                    }}
                    className="btn-ghost shrink-0 px-3 text-xs"
                  >
                    সেট করো
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
