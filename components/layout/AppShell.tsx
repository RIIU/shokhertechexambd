"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { Level, Role, StreamId } from "@/lib/types";

export interface SessionUser {
  id: string;
  name: string;
  role: Role;
  phone: string;
  level?: Level;
  stream?: StreamId;
}

interface AppShellValue {
  user: SessionUser | null;
  loading: boolean;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const AppShellContext = createContext<AppShellValue | null>(null);

/**
 * Shared client state for the site chrome (header, mobile drawer, bottom tab
 * bar): who is signed in (fetched once per navigation) and whether the menu is open.
 */
export function AppShellProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<{ user: SessionUser | null; loading: boolean }>({ user: null, loading: true });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json() as Promise<{ user: SessionUser | null }>)
      .then((d) => alive && setSession({ user: d.user, loading: false }))
      .catch(() => alive && setSession({ user: null, loading: false }));
    return () => {
      alive = false;
    };
  }, [pathname]);

  // Any navigation closes the menu.
  useEffect(() => setMenuOpen(false), [pathname]);

  const value = useMemo(() => ({ ...session, menuOpen, setMenuOpen }), [session, menuOpen]);
  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}

export function useAppShell(): AppShellValue {
  const ctx = useContext(AppShellContext);
  if (!ctx) throw new Error("useAppShell must be used inside <AppShellProvider>");
  return ctx;
}
