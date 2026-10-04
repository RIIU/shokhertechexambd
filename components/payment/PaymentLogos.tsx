import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

interface LogoProps extends SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

/** Official bKash (বিকাশ) Brand Logo SVG */
export function BkashLogo({ className, size = 32, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      {...props}
    >
      <defs>
        <linearGradient id="bkash-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2136E" />
          <stop offset="100%" stopColor="#A50048" />
        </linearGradient>
      </defs>
      {/* bKash signature origami bird */}
      <polygon points="52,12 88,38 64,52 64,28" fill="#E2136E" />
      <polygon points="12,50 52,12 52,50" fill="#D12053" />
      <polygon points="52,50 64,52 88,38 52,68" fill="#B8084A" />
      <polygon points="12,50 52,68 34,92" fill="#E2136E" />
      <polygon points="52,68 88,88 74,60" fill="#E2136E" />
      <polygon points="52,68 74,60 64,52" fill="#990038" />
    </svg>
  );
}

/** Official Nagad (নগদ) Brand Logo SVG */
export function NagadLogo({ className, size = 32, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      {...props}
    >
      <defs>
        <linearGradient id="nagad-orange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F7931E" />
          <stop offset="100%" stopColor="#ED1C24" />
        </linearGradient>
      </defs>
      {/* Nagad dynamic swoosh flame */}
      <circle cx="50" cy="50" r="44" fill="#1C1A1A" />
      <path
        d="M26,62 C28,38 48,22 66,28 C74,32 76,40 70,46 C62,54 48,52 42,42 C38,36 40,30 42,28 C34,34 32,46 36,56 C40,64 48,70 58,70 C72,70 78,58 78,58 C78,58 72,76 56,76 C40,76 25,72 26,62 Z"
        fill="url(#nagad-orange)"
      />
      <circle cx="58" cy="42" r="6" fill="#F7931E" />
    </svg>
  );
}

/** Official Rocket (রকেট - Dutch-Bangla Bank) Brand Logo SVG */
export function RocketLogo({ className, size = 32, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      {...props}
    >
      <defs>
        <linearGradient id="rocket-purple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8C3494" />
          <stop offset="100%" stopColor="#551F72" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="24" fill="url(#rocket-purple)" />
      {/* Dynamic angled Rocket */}
      <path
        d="M62,22 C52,26 40,40 36,52 L48,64 C60,60 74,48 78,38 C80,32 76,24 70,22 C68,21 64,21 62,22 Z"
        fill="#FFFFFF"
      />
      <path d="M36,52 L24,54 L32,68 L48,64 Z" fill="#F39200" />
      <circle cx="60" cy="40" r="5" fill="#8C3494" />
      {/* Rocket flame */}
      <polygon points="28,68 18,84 34,74" fill="#ED1C24" />
      <polygon points="26,70 20,80 30,73" fill="#FFF200" />
    </svg>
  );
}

/** Official Upay Logo SVG */
export function UpayLogo({ className, size = 32, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      {...props}
    >
      <rect width="100" height="100" rx="24" fill="#002554" />
      <circle cx="36" cy="50" r="16" fill="#FFC80A" />
      <circle cx="64" cy="50" r="16" fill="#00A3E0" fillOpacity="0.8" />
    </svg>
  );
}
