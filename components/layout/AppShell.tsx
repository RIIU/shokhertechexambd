"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Level, Role, StreamId } from "@/lib/types";

export interface SessionUser {
  id: string;
  name: string;
  role: Role;
  phone: string;
  level?: Level;
  stream?: StreamId;
  institution?: string;
  avatarUrl?: string;
  coverUrl?: string;
  bio?: string;
}

interface AppShellValue {
  user: SessionUser | null;
  loading: boolean;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AppShellContext = createContext<AppShellValue | null>(null);

/**
 * Shared client state for the site chrome (header, mobile drawer, bottom tab
 * bar): who is signed in (reactively fetched on every route change) and whether the menu is open.
 */
export function AppShellProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<{ user: SessionUser | null; loading: boolean }>({ user: null, loading: true });
  const [menuOpen, setMenuOpen] = useState(false);

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch session");
      const d = (await res.json()) as { user: SessionUser | null };
      setSession({ user: d.user, loading: false });
    } catch {
      setSession({ user: null, loading: false });
    }
  }, []);

  // Fetch session on initial mount and whenever route changes (real-time auth sync)
  useEffect(() => {
    void refreshUser();
  }, [pathname, refreshUser]);

  // Periodic heartbeat session check (every 60s) for real-time app feel
  useEffect(() => {
    const timer = setInterval(() => {
      void refreshUser();
    }, 60000);
    return () => clearInterval(timer);
  }, [refreshUser]);

  // Any navigation closes the menu.
  useEffect(() => setMenuOpen(false), [pathname]);

  const logout = useCallback(async () => {
    try {
      setSession({ user: null, loading: false });
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      window.location.href = "/login";
    }
  }, [router]);

  const value = useMemo(
    () => ({ ...session, menuOpen, setMenuOpen, refreshUser, logout }),
    [session, menuOpen, refreshUser, logout],
  );

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}

export function useAppShell(): AppShellValue {
  const ctx = useContext(AppShellContext);
  if (!ctx) throw new Error("useAppShell must be used inside <AppShellProvider>");
  return ctx;
}
