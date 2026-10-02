import {
  Atom,
  Banknote,
  BookOpen,
  Brain,
  Briefcase,
  Calculator,
  Cpu,
  Dna,
  Factory,
  FlaskConical,
  Globe2,
  Landmark,
  Languages,
  Microscope,
  Moon,
  Receipt,
  Scale,
  Sigma,
  TrendingUp,
  Users,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import type { SubjectIconKey } from "@/lib/types";

const ICONS: Record<SubjectIconKey, LucideIcon> = {
  atom: Atom,
  flask: FlaskConical,
  dna: Dna,
  sigma: Sigma,
  calculator: Calculator,
  microscope: Microscope,
  cpu: Cpu,
  book: BookOpen,
  languages: Languages,
  globe: Globe2,
  landmark: Landmark,
  scale: Scale,
  trending: TrendingUp,
  briefcase: Briefcase,
  receipt: Receipt,
  banknote: Banknote,
  brain: Brain,
  users: Users,
  factory: Factory,
  moon: Moon,
};

export function SubjectIcon({ icon, ...props }: { icon: SubjectIconKey } & LucideProps) {
  const Icon = ICONS[icon];
  return <Icon strokeWidth={1.5} {...props} />;
}
