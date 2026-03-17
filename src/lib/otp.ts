import crypto from "node:crypto";
import { createTransport, type Transporter } from "nodemailer";
import { env } from "@/lib/env";

let mailTransporter: Transporter | null = null;

export type OtpPurpose = "login" | "register" | "reset_password";

function getMailer() {
  if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }

  if (!mailTransporter) {
    mailTransporter = createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  return mailTransporter;
}

export function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function hashOtp(identifier: string, code: string) {
  return crypto.createHash("sha256").update(`${identifier}:${code}`).digest("hex");
}

export async function sendOtpCode(input: {
  email: string;
  code: string;
  purpose?: OtpPurpose;
}) {
  const mailer = getMailer();

  if (!mailer) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.");
    }

    console.log(`[OTP email] ${input.email}: ${input.code}`);
    return;
  }

  const appUrl = env.APP_URL;
  const from = env.SMTP_FROM || env.SMTP_USER;
  const purpose = input.purpose ?? "login";
  const purposeLine =
    purpose === "reset_password"
      ? "Use this OTP to reset your FinEdge password."
      : purpose === "register"
        ? "Use this OTP to verify your FinEdge account."
        : "Use this OTP to sign in to FinEdge.";
  const subject =
    purpose === "reset_password"
      ? "Reset your FinEdge password"
      : purpose === "register"
        ? "Verify your FinEdge account"
        : "Your FinEdge OTP Code";
  const text = `${purposeLine} OTP: ${input.code}. It expires in 10 minutes. If you did not request this, ignore this email.`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0d1b2a;">
      <p>${purposeLine}</p>
      <p>Your FinEdge OTP code is:</p>
      <p style="font-size:24px;font-weight:700;letter-spacing:4px;">${input.code}</p>
      <p>This code expires in 10 minutes.</p>
      <p>If you did not request this, you can safely ignore this email.</p>
      <p style="margin-top:16px;">App: <a href="${appUrl}">${appUrl}</a></p>
    </div>
  `;

  await mailer.sendMail({
    from,
    to: input.email,
    subject,
    text,
    html,
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(`[OTP email sent] ${input.email}`);
  }
}
