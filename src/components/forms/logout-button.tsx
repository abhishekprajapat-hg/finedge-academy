"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { dispatchAuthChanged } from "@/lib/auth-events";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        dispatchAuthChanged();
      }
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" className="whitespace-nowrap" onClick={handleLogout} disabled={loading}>
      {loading ? "Signing out..." : "Sign out"}
    </Button>
  );
}

