import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard, ShieldCheck, User } from "lucide-react";
import { requireUser } from "@/lib/server/auth";
import { ProfileForm } from "@/components/profile/ProfileForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "আমার প্রোফাইল | ShokherTech Exam BD",
  description: "ব্যবহারকারীর প্রোফাইল তথ্য, কভার ও প্রোফাইল ছবি সম্পাদনা",
};

export default async function ProfilePage() {
  const user = await requireUser("/profile");

  const backHref = user.role === "admin" ? "/admin" : "/dashboard";
  const backLabel = user.role === "admin" ? "অ্যাডমিন প্যানেল" : "ড্যাশবোর্ড";

  return (
    <main className="relative min-h-[calc(100vh-64px)] pb-16 pt-6 sm:pt-10">
      <div className="page-backdrop" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[380px] bg-radial-brand opacity-60" />

      <div className="container max-w-4xl space-y-6">
        {/* Breadcrumb / Back button */}
        <div className="flex items-center justify-between">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-xl border border-surface-border bg-obsidian-900/80 px-3.5 py-1.5 text-xs font-semibold text-ink-muted backdrop-blur transition-colors hover:border-brand-400 hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span lang="bn">{backLabel}-এ ফিরে যাও</span>
          </Link>

          <span className="chip text-xs">
            {user.role === "admin" ? (
              <ShieldCheck className="h-3.5 w-3.5 text-brand-400" />
            ) : (
              <User className="h-3.5 w-3.5 text-teal-400" />
            )}
            <span lang="bn">{user.role === "admin" ? "অ্যাডমিন প্রোফাইল" : "শিক্ষার্থী প্রোফাইল"}</span>
          </span>
        </div>

        {/* Profile Heading */}
        <div>
          <h1 lang="bn" className="text-3xl font-extrabold text-ink sm:text-4xl">
            প্রোফাইল <span className="text-gradient">সেটিংস ও ছবি</span>
          </h1>
          <p lang="bn" className="mt-1 text-sm text-ink-muted">
            তোমার নাম, বায়ো, শিক্ষাপ্রতিষ্ঠান, কভার ব্যানার এবং প্রোফাইল অ্যাভাটার কাস্টমাইজ করো।
          </p>
        </div>

        {/* Interactive Profile Form */}
        <ProfileForm initialUser={user} />
      </div>
    </main>
  );
}
