"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dispatchAuthChanged } from "@/lib/auth-events";

type LoginFormProps = {
  redirectTo?: string;
  initialMode?: "login" | "register";
};

export function LoginForm({ redirectTo = "/dashboard", initialMode = "login" }: LoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register" | "forgot">(initialMode);
  const [registerStep, setRegisterStep] = useState<"details" | "verify">("details");
  const [forgotStep, setForgotStep] = useState<"request" | "verify">("request");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerCode, setRegisterCode] = useState("");

  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotPassword, setForgotPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);

  const switchMode = (nextMode: "login" | "register" | "forgot") => {
    setMode(nextMode);
    setMessage(null);
    setDevCode(null);
    if (nextMode === "register") {
      setRegisterStep("details");
      setRegisterCode("");
    }
    if (nextMode === "forgot") {
      setForgotStep("request");
      setForgotCode("");
      setForgotPassword("");
      setForgotConfirmPassword("");
    }
  };

  const loginWithPassword = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !data.ok) {
        setMessage(data.error ?? "Unable to login");
        return;
      }

      dispatchAuthChanged();
      router.push(redirectTo);
      router.refresh();
    } catch {
      setMessage("Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const requestRegisterOtp = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/register/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: registerName,
          email: registerEmail,
          password: registerPassword,
          confirmPassword: registerConfirmPassword,
        }),
      });

      const data = (await response.json()) as { ok: boolean; error?: string; devCode?: string };
      if (!response.ok || !data.ok) {
        setMessage(data.error ?? "Unable to send registration OTP");
        return;
      }

      setDevCode(data.devCode ?? null);
      setRegisterStep("verify");
      setMessage("OTP sent. Enter code to complete registration.");
    } catch {
      setMessage("Unable to send registration OTP.");
    } finally {
      setLoading(false);
    }
  };

  const verifyRegisterOtp = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/register/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerEmail,
          code: registerCode,
        }),
      });

      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setMessage(data.error ?? "OTP verification failed");
        return;
      }

      dispatchAuthChanged();
      router.push(redirectTo);
      router.refresh();
    } catch {
      setMessage("Unable to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  const requestForgotOtp = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/forgot-password/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
        }),
      });

      const data = (await response.json()) as { ok: boolean; error?: string; message?: string; devCode?: string };
      if (!response.ok || !data.ok) {
        setMessage(data.error ?? "Unable to send reset OTP");
        return;
      }

      setDevCode(data.devCode ?? null);
      setForgotStep("verify");
      setMessage(data.message ?? "OTP sent. Enter code and set a new password.");
    } catch {
      setMessage("Unable to send reset OTP.");
    } finally {
      setLoading(false);
    }
  };

  const verifyForgotOtp = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          code: forgotCode,
          password: forgotPassword,
          confirmPassword: forgotConfirmPassword,
        }),
      });

      const data = (await response.json()) as { ok: boolean; error?: string; message?: string };
      if (!response.ok || !data.ok) {
        setMessage(data.error ?? "Unable to reset password");
        return;
      }

      setMode("login");
      setForgotStep("request");
      setLoginEmail(forgotEmail);
      setLoginPassword("");
      setForgotCode("");
      setForgotPassword("");
      setForgotConfirmPassword("");
      setDevCode(null);
      setMessage(data.message ?? "Password updated. Please login.");
    } catch {
      setMessage("Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="finedge-form-surface space-y-4 rounded-2xl p-6">
      <div className="space-y-2">
        <p className="inline-flex items-center gap-2 rounded-full border border-[#bcd8ea] bg-[#e8f5ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#3f6384]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#006d77]" />
          Secure Access
        </p>
        <h1 className="text-2xl font-bold text-[#0d1b2a]">
          {mode === "login" ? "Email + Password Login" : mode === "register" ? "Create New Account" : "Reset Password"}
        </h1>
        <p className="text-sm text-[#4d6480]">
          {mode === "login"
            ? "Login with your email and password."
            : mode === "register"
              ? "Register with your details and verify OTP to continue."
              : "Get OTP on email and set a new password."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl border border-[#c8dded] bg-white p-1">
        <Button type="button" variant={mode === "login" ? "default" : "ghost"} onClick={() => switchMode("login")}>
          Login
        </Button>
        <Button
          type="button"
          variant={mode === "register" ? "default" : "ghost"}
          onClick={() => switchMode("register")}
        >
          Register
        </Button>
      </div>

      {mode === "login" ? (
        <form onSubmit={loginWithPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            <KeyRound className="mr-2 h-4 w-4" />
            {loading ? "Please wait..." : "Login"}
          </Button>

          <button
            type="button"
            className="text-sm font-semibold text-[#0b5f86] underline decoration-[#8fbad6] underline-offset-4 hover:text-[#003f5c]"
            onClick={() => {
              setForgotEmail(loginEmail);
              switchMode("forgot");
            }}
          >
            Forgot password?
          </button>
        </form>
      ) : null}

      {mode === "register" ? (
        <form onSubmit={registerStep === "details" ? requestRegisterOtp : verifyRegisterOtp} className="space-y-4">
          {registerStep === "details" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="register-name">Name</Label>
                <Input
                  id="register-name"
                  value={registerName}
                  onChange={(event) => setRegisterName(event.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={registerEmail}
                  onChange={(event) => setRegisterEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={registerPassword}
                  onChange={(event) => setRegisterPassword(event.target.value)}
                  placeholder="Create password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">Confirm Password</Label>
                <Input
                  id="register-confirm-password"
                  type="password"
                  value={registerConfirmPassword}
                  onChange={(event) => setRegisterConfirmPassword(event.target.value)}
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="register-otp">OTP</Label>
                <Input
                  id="register-otp"
                  value={registerCode}
                  onChange={(event) => setRegisterCode(event.target.value)}
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  required
                />
              </div>

              <Button type="button" variant="ghost" className="w-full" onClick={() => setRegisterStep("details")}>
                Edit registration details
              </Button>
            </>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            <KeyRound className="mr-2 h-4 w-4" />
            {loading ? "Please wait..." : registerStep === "details" ? "Send OTP" : "Verify OTP & Login"}
          </Button>
        </form>
      ) : null}

      {mode === "forgot" ? (
        <form onSubmit={forgotStep === "request" ? requestForgotOtp : verifyForgotOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="forgot-email">Email</Label>
            <Input
              id="forgot-email"
              type="email"
              value={forgotEmail}
              onChange={(event) => setForgotEmail(event.target.value)}
              placeholder="you@example.com"
              required
              disabled={forgotStep === "verify"}
            />
          </div>

          {forgotStep === "verify" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="forgot-otp">OTP</Label>
                <Input
                  id="forgot-otp"
                  value={forgotCode}
                  onChange={(event) => setForgotCode(event.target.value)}
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="forgot-password">New Password</Label>
                <Input
                  id="forgot-password"
                  type="password"
                  value={forgotPassword}
                  onChange={(event) => setForgotPassword(event.target.value)}
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="forgot-confirm-password">Confirm New Password</Label>
                <Input
                  id="forgot-confirm-password"
                  type="password"
                  value={forgotConfirmPassword}
                  onChange={(event) => setForgotConfirmPassword(event.target.value)}
                  placeholder="Re-enter new password"
                  required
                />
              </div>

              <Button type="button" variant="ghost" className="w-full" onClick={() => setForgotStep("request")}>
                Change email
              </Button>
            </>
          ) : null}

          <Button type="submit" className="w-full" disabled={loading}>
            <KeyRound className="mr-2 h-4 w-4" />
            {loading ? "Please wait..." : forgotStep === "request" ? "Send OTP" : "Verify OTP & Change Password"}
          </Button>

          <Button type="button" variant="ghost" className="w-full" onClick={() => switchMode("login")}>
            Back to login
          </Button>
        </form>
      ) : null}

      {message ? <p className="text-sm font-medium text-[#345372]">{message}</p> : null}
      {devCode ? <p className="text-xs font-semibold text-[#9a5b10]">Dev OTP: {devCode}</p> : null}
    </div>
  );
}
