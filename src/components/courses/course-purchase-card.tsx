"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { BadgeCheck, FileText, PlayCircle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/format";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: (data: unknown) => void) => void;
    };
  }
}

type CoursePurchaseCardProps = {
  courseId: string;
  title: string;
  pricePaise: number;
  purchased: boolean;
};

export function CoursePurchaseCard({ courseId, title, pricePaise, purchased }: CoursePurchaseCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isDevMode = process.env.NODE_ENV !== "production";

  const cta = useMemo(() => {
    if (purchased) {
      return "Purchased";
    }
    return loading ? "Creating Order..." : "Buy with Razorpay";
  }, [loading, purchased]);

  const benefits = [
    {
      icon: PlayCircle,
      label: "Structured video modules",
    },
    {
      icon: FileText,
      label: "Practical, implementation-first lessons",
    },
    {
      icon: BadgeCheck,
      label: "Lifetime course access",
    },
    {
      icon: ShieldCheck,
      label: "Secure checkout workflow",
    },
  ];

  const handlePurchase = async () => {
    if (purchased) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        keyId?: string;
        order?: { id: string; amount: number; currency: string };
      };

      if (!response.ok || !data.ok || !data.keyId || !data.order) {
        setMessage(data.error ?? "Unable to create payment order");
        return;
      }

      if (!window.Razorpay) {
        setMessage("Razorpay SDK not loaded");
        return;
      }

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "FinEdge Academy",
        description: title,
        order_id: data.order.id,
        handler: () => {
          setMessage("Payment received. Course access will unlock after webhook verification.");
        },
      });

      razorpay.on("payment.failed", () => {
        setMessage("Payment failed. Please try again.");
      });

      razorpay.open();
    } catch {
      setMessage("Unable to start checkout");
    } finally {
      setLoading(false);
    }
  };

  const handleTestEnroll = async () => {
    if (purchased) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/payments/dev-enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });

      const data = (await response.json()) as { ok: boolean; error?: string; alreadyPurchased?: boolean };
      if (!response.ok || !data.ok) {
        setMessage(data.error ?? "Unable to complete test enrollment");
        return;
      }

      setMessage(data.alreadyPurchased ? "Course already unlocked." : "Test enrollment successful.");
      router.push(`/dashboard/learning/${courseId}`);
      router.refresh();
    } catch {
      setMessage("Unable to complete test enrollment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Card className="overflow-hidden border-[#c6d8e9] shadow-[0_28px_56px_-42px_rgba(9,30,66,0.8)]">
        <CardHeader className="space-y-3 bg-gradient-to-br from-[#082638] via-[#0b3d55] to-[#0f5161] text-white">
          <Badge className="w-fit border-white/25 bg-white/10 text-[#daf1fa]">Course Access</Badge>
          <CardTitle className="line-clamp-2 text-xl text-white">{title}</CardTitle>
          <p className="text-sm text-[#d5e8f4]">One-time payment. Learn at your own pace.</p>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          <div className="rounded-xl border border-[#d1e1ef] bg-[#f4f9ff] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#547693]">Program Fee</p>
            <p className="text-3xl font-bold text-[#0d1b2a]">{formatINR(pricePaise)}</p>
          </div>

          <div className="space-y-2 rounded-xl border border-[#d1e1ef] p-4">
            {benefits.map((item) => (
              <div key={item.label} className="flex items-start gap-2 text-sm text-[#36506d]">
                <item.icon className="mt-0.5 h-4 w-4 text-[#006d77]" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <Button className="w-full" onClick={handlePurchase} disabled={loading || purchased}>
            {cta}
          </Button>
          {isDevMode ? (
            <Button type="button" variant="outline" className="w-full" onClick={handleTestEnroll} disabled={loading || purchased}>
              {loading ? "Please wait..." : "Test Enroll (No Payment)"}
            </Button>
          ) : null}
          <p className="text-xs text-[#5f7893]">Access is granted after backend verification for successful transactions.</p>
          {isDevMode ? <p className="text-xs text-[#9a5b10]">Dev mode: test enroll unlocks course without Razorpay payment.</p> : null}
          {message ? <p className="text-sm text-[#36506d]">{message}</p> : null}
        </CardContent>
      </Card>
    </>
  );
}

