import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/AuthForms";
import { getCurrentUser } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Create account" };
export const dynamic = "force-dynamic";

export default async function RegisterPage({ searchParams }: { searchParams: { next?: string } }) {
  if (await getCurrentUser()) redirect("/dashboard");
  const next = searchParams.next;

  return (
    <AuthShell
      title="নতুন অ্যাকাউন্ট"
      subtitle="ফ্রি অ্যাকাউন্ট খুলে পরীক্ষা দেওয়া শুরু করো।"
      footer={
        <>
          আগেই অ্যাকাউন্ট আছে?{" "}
          <Link href={next ? `/login?next=${encodeURIComponent(next)}` : "/login"} className="font-semibold text-brand-400 hover:underline">
            লগইন করো
          </Link>
        </>
      }
    >
      <RegisterForm next={next} />
    </AuthShell>
  );
}
