import type { Metadata } from "next";
import { StreamSubjectsView } from "@/components/subjects/StreamSubjectsView";

export const metadata: Metadata = {
  title: "SSC Science Subjects",
  description:
    "এসএসসি বিজ্ঞান বিভাগের পদার্থবিজ্ঞান, রসায়ন, উচ্চতর গণিত, জীববিজ্ঞানসহ সব বিষয়ের অধ্যায়ভিত্তিক অনুশীলন, মডেল টেস্ট ও লাইভ পরীক্ষা।",
};

/**
 * /ssc/science: SSC Science subject grid.
 * The layout (hero, stream switcher, GSAP grid, exam-type sheet) is shared by
 * all six level × stream pages through StreamSubjectsView.
 */
export default function SscSciencePage() {
  return <StreamSubjectsView level="ssc" stream="science" />;
}
