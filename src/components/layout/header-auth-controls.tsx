"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { LogoutButton } from "@/components/forms/logout-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { AUTH_CHANGED_EVENT } from "@/lib/auth-events";

type SessionUser = {
  id: string;
  role: "USER" | "ADMIN";
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
};

export function HeaderAuthControls() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const refreshUser = useCallback(async () => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });
      const data = (await response.json()) as { ok?: boolean; user?: SessionUser | null };
      setUser(data.ok ? data.user ?? null : null);
    } catch {
      if (!controller.signal.aborted) {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      void refreshUser();
    }, 0);

    const onAuthChanged = () => {
      void refreshUser();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void refreshUser();
      }
    };

    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    window.addEventListener("focus", onAuthChanged);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.clearTimeout(initialTimer);
      requestRef.current?.abort();
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
      window.removeEventListener("focus", onAuthChanged);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refreshUser]);

  return (
    <div className="flex w-full items-center justify-between gap-2 md:w-auto md:justify-end">
      <ThemeToggle />
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <Button asChild size="sm" className="gap-1.5 whitespace-nowrap">
              <Link href="/dashboard" prefetch={false}>
                Dashboard
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
            <LogoutButton />
          </>
        ) : (
          <>
            <Button asChild size="sm" variant="outline" className="whitespace-nowrap">
              <Link href="/login" prefetch={false}>
                Login
              </Link>
            </Button>
            <Button asChild size="sm" className="gap-1.5 whitespace-nowrap">
              <Link href="/register" prefetch={false}>
                Get Started
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
