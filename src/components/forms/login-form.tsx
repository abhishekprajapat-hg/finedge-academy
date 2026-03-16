"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginFormProps = {
  redirectTo?: string;
};

export function LoginForm({ redirectTo = "/dashboard" }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  const requestOtp = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
        }),
      });

      const data = (await response.json()) as { ok: boolean; error?: string; devCode?: string };

      if (!response.ok || !data.ok) {
        setMessage(data.error ?? "Unable to send OTP");
        return;
      }

      setMessage("OTP sent to your email. Please verify to continue.");
      setDevCode(data.devCode ?? null);
      setStep("verify");
    } catch {
      setMessage("Unable to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          fullName: fullName || undefined,
        }),
      });

      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setMessage(data.error ?? "OTP verification failed");
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setMessage("Unable to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 rounded-2xl border border-[#c7daeb] bg-[linear-gradient(155deg,#ffffff_0%,#f3f9ff_100%)] p-6 shadow-[0_30px_62px_-46px_rgba(9,30,66,0.8)]">
      <div className="space-y-2">
        <p className="inline-flex items-center gap-2 rounded-full border border-[#bcd8ea] bg-[#e8f5ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3f6384]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#006d77]" />
          Secure Sign-In
        </p>
        <h1 className="text-2xl font-bold text-[#0d1b2a]">Email OTP Login</h1>
        <p className="text-sm text-[#4d6480]">Sign in using your email and one-time password.</p>
      </div>

      <form onSubmit={step === "request" ? requestOtp : verifyOtp} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            disabled={step === "verify"}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name (Optional)</Label>
          <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} />
        </div>

        {step === "verify" ? (
          <div className="space-y-2">
            <Label htmlFor="code">OTP Code</Label>
            <Input
              id="code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              maxLength={6}
              placeholder="6-digit OTP"
              required
            />
          </div>
        ) : null}

        <Button type="submit" className="w-full" disabled={loading}>
          <KeyRound className="mr-2 h-4 w-4" />
          {loading ? "Please wait..." : step === "request" ? "Send OTP" : "Verify OTP"}
        </Button>

        {step === "verify" ? (
          <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("request")}>
            Edit email
          </Button>
        ) : null}
      </form>

      {message ? <p className="text-sm font-medium text-[#345372]">{message}</p> : null}
      {devCode ? <p className="text-xs font-semibold text-[#9a5b10]">Dev OTP: {devCode}</p> : null}
    </div>
  );
}
