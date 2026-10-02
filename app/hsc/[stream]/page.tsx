import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StreamSubjectsView } from "@/components/subjects/StreamSubjectsView";
import { STREAMS, STREAM_IDS, isStream } from "@/lib/data/catalog";

interface PageProps {
  params: { stream: string };
}

export function generateStaticParams() {
  return STREAM_IDS.map((stream) => ({ stream }));
}

export const dynamicParams = false;

export function generateMetadata({ params }: PageProps): Metadata {
  return isStream(params.stream) ? { title: `HSC ${STREAMS[params.stream].nameEn} Subjects` } : {};
}

export default function HscStreamPage({ params }: PageProps) {
  if (!isStream(params.stream)) notFound();
  return <StreamSubjectsView level="hsc" stream={params.stream} />;
}
