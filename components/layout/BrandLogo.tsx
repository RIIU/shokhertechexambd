import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The official lockup. Its wordmark is white with a lime "Academy" chip, so it
 * only belongs on the dark green surfaces.
 */
export function BrandLogo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/shokher-tech-academy-logo.png"
      alt="Shokher Tech Academy"
      width={769}
      height={218}
      priority={priority}
      className={cn("w-auto", className)}
    />
  );
}
