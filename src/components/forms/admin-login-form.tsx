"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dispatchAuthChanged } from "@/lib/auth-events";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setMessage(data.error ?? "Admin login failed");
        return;
      }

      dispatchAuthChanged();
      router.push("/admin");
      router.refresh();
    } catch {
      setMessage("Unable to sign in as admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="finedge-form-surface mx-auto w-full max-w-md rounded-2xl p-6">
      <h1 className="text-2xl font-bold text-[#0d1b2a]">Admin Login</h1>
      <p className="mt-1 text-sm text-[#4d6480]">Only authorized admins can access the control center.</p>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-email">Admin Email</Label>
          <Input
            id="admin-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-password">Admin Password</Label>
          <Input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter secure password"
            required
            minLength={8}
          />
        </div>

        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login as Admin"}
        </Button>
      </form>

      {message ? <p className="mt-3 text-sm text-rose-700">{message}</p> : null}
    </div>
  );
}
