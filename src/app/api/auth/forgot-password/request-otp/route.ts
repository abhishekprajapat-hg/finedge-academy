import { NextResponse } from "next/server";
import { getEmailVerifiedAtByUserId } from "@/lib/email-verification";
import { badRequest, serverError, tooManyRequests } from "@/lib/http";
import { generateOtpCode, hashOtp, sendOtpCode } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import { forgotPasswordRequestSchema, normalizeEmailIdentifier } from "@/lib/validations/auth";

const OTP_TTL_MINUTES = 10;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordRequestSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid forgot password payload", parsed.error.flatten());
    }

    let email: string;
    try {
      email = normalizeEmailIdentifier(parsed.data.email);
    } catch (error) {
      return badRequest(error instanceof Error ? error.message : "Invalid email");
    }

    const ip = requestIp(request);
    const limiter = rateLimit(`forgot-password:${ip}:${email}`, { limit: 5, windowMs: 10 * 60 * 1000 });
    if (limiter.limited) {
      return tooManyRequests(limiter.resetInSeconds, "Too many OTP requests. Try again later.");
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
      },
    });

    if (!user) {
      return badRequest("No account found with this email. Please register first.");
    }

    const emailVerifiedAt = await getEmailVerifiedAtByUserId(user.id);
    if (!emailVerifiedAt) {
      return badRequest("Email is not verified yet. Complete registration OTP first.");
    }

    const code = generateOtpCode();
    const codeHash = hashOtp(email, code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await prisma.otpRequest.create({
      data: {
        identifier: email,
        channel: "reset_password",
        codeHash,
        expiresAt,
        userId: user.id,
      },
    });

    await sendOtpCode({ email, code, purpose: "reset_password" });

    return NextResponse.json({
      ok: true,
      message: "OTP sent to your email.",
      devCode: process.env.NODE_ENV === "production" ? undefined : code,
    });
  } catch (error) {
    console.error(error);
    return serverError("Unable to send forgot password OTP");
  }
}
