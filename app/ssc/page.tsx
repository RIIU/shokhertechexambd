import type { Metadata } from "next";
import { LevelOverview } from "@/components/landing/LevelOverview";

export const metadata: Metadata = { title: "SSC Exam System" };

export default function SscPage() {
  return <LevelOverview level="ssc" />;
}
