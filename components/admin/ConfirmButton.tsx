"use client";

import type { ReactNode } from "react";

/** Submit button that asks before a destructive form action runs. */
export function ConfirmButton({ message, className, children, ariaLabel }: { message: string; className?: string; children: ReactNode; ariaLabel?: string }) {
  return (
    <button
      type="submit"
      aria-label={ariaLabel}
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
