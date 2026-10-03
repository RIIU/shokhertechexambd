"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/types";

export interface SessionUser {
  id: string;
  name: string;
  role: Role;
  phone: string;
}

/** Signed-in user for client components. Re-checks on navigation (login/logout redirect). */
export function useSessionUser(): { user: SessionUser | null; loading: boolean } {
  const pathname = usePathname();
  const [state, setState] = useState<{ user: SessionUser | null; loading: boolean }>({ user: null, loading: true });

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json() as Promise<{ user: SessionUser | null }>)
      .then((d) => alive && setState({ user: d.user, loading: false }))
      .catch(() => alive && setState({ user: null, loading: false }));
    return () => {
      alive = false;
    };
  }, [pathname]);

  return state;
}
