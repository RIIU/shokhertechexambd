import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/AuthForms";
import { getCurrentUser } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Login" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "admin" ? "/admin" : "/dashboard");
  const next = searchParams.next;

  return (
    <AuthShell
      title="আবার স্বাগতম"
      subtitle="মোবাইল নম্বর আর পাসওয়ার্ড দিয়ে লগইন করো।"
      footer={
        <>
          অ্যাকাউন্ট নেই?{" "}
          <Link href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="font-semibold text-brand-400 hover:underline">
            নতুন অ্যাকাউন্ট খোলো
          </Link>
        </>
      }
    >
      <LoginForm next={next} />
    </AuthShell>
  );
}
