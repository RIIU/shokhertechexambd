import type { Metadata } from "next";
import { StreamSubjectsView } from "@/components/subjects/StreamSubjectsView";
import { isLevel, isStream } from "@/lib/data/catalog";
import type { Level, StreamId } from "@/lib/types";

export const metadata: Metadata = {
  title: "সকল বিষয়সমূহ ও সিলেবাস | Shokher Tech Academy",
  description:
    "এসএসসি ও এইচএসসি সকল বিভাগের (বিজ্ঞান, মানবিক, ব্যবসায় শিক্ষা) বিষয়ভিত্তিক অনুশীলন, মডেল টেস্ট ও লাইভ পরীক্ষা।",
};

interface SubjectsPageProps {
  searchParams?: { level?: string; stream?: string };
}

export default async function SubjectsPage({ searchParams }: SubjectsPageProps) {
  const level: Level = isLevel(searchParams?.level ?? "") ? (searchParams!.level as Level) : "ssc";
  const stream: StreamId = isStream(searchParams?.stream ?? "") ? (searchParams!.stream as StreamId) : "science";

  return <StreamSubjectsView level={level} stream={stream} />;
}

export const dynamic = "force-dynamic";
