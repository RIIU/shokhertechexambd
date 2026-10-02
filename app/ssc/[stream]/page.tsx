import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StreamSubjectsView } from "@/components/subjects/StreamSubjectsView";
import { STREAMS, STREAM_IDS, isStream } from "@/lib/data/catalog";

interface PageProps {
  params: { stream: string };
}

export function generateStaticParams() {
  // /ssc/science has its own static route (app/ssc/science/page.tsx).
  return STREAM_IDS.filter((stream) => stream !== "science").map((stream) => ({ stream }));
}

export const dynamicParams = false;

export function generateMetadata({ params }: PageProps): Metadata {
  return isStream(params.stream) ? { title: `SSC ${STREAMS[params.stream].nameEn} Subjects` } : {};
}

export default function SscStreamPage({ params }: PageProps) {
  if (!isStream(params.stream)) notFound();
  return <StreamSubjectsView level="ssc" stream={params.stream} />;
}
