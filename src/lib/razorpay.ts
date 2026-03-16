import crypto from "node:crypto";
import Razorpay from "razorpay";
import { env } from "@/lib/env";

let instance: Razorpay | null = null;

export function hasRazorpayConfigured() {
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
}

export function getRazorpayClient() {
  if (!hasRazorpayConfigured()) {
    throw new Error("Razorpay is not configured");
  }

  if (!instance) {
    instance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID!,
      key_secret: env.RAZORPAY_KEY_SECRET!,
    });
  }

  return instance;
}

export function verifyRazorpayWebhookSignature(payload: string, signature: string) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    return false;
  }

  const expected = crypto
    .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

