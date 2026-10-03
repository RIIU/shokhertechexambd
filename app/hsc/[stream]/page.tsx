import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StreamSubjectsView } from "@/components/subjects/StreamSubjectsView";
import { STREAMS, isStream } from "@/lib/data/catalog";

interface PageProps {
  params: { stream: string };
}

export function generateMetadata({ params }: PageProps): Metadata {
  return isStream(params.stream) ? { title: `HSC ${STREAMS[params.stream].nameEn} Subjects` } : {};
}

export default function HscStreamPage({ params }: PageProps) {
  if (!isStream(params.stream)) notFound();
  return <StreamSubjectsView level="hsc" stream={params.stream} />;
}

// Published exams come from the database, so always render fresh (unknown streams 404 via notFound()).
export const dynamic = "force-dynamic";
