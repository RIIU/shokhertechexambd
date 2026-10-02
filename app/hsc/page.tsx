import type { Metadata } from "next";
import { LevelOverview } from "@/components/landing/LevelOverview";

export const metadata: Metadata = { title: "HSC Exam System" };

export default function HscPage() {
  return <LevelOverview level="hsc" />;
}
