import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOtpCode, hashOtp, sendOtpCode } from "@/lib/otp";
import { badRequest, serverError, tooManyRequests } from "@/lib/http";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import { normalizeEmailIdentifier, otpRequestSchema } from "@/lib/validations/auth";

const OTP_TTL_MINUTES = 10;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = otpRequestSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid OTP request", parsed.error.flatten());
    }

    let email: string;
    try {
      email = normalizeEmailIdentifier(parsed.data.email);
    } catch (error) {
      return badRequest(error instanceof Error ? error.message : "Invalid email");
    }

    const ip = requestIp(request);
    const limiter = rateLimit(`otp:${ip}:${email}`, { limit: 5, windowMs: 10 * 60 * 1000 });
    if (limiter.limited) {
      return tooManyRequests(limiter.resetInSeconds, "Too many OTP requests. Try again later.");
    }

    const code = generateOtpCode();
    const codeHash = hashOtp(email, code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await prisma.otpRequest.create({
      data: {
        identifier: email,
        channel: "email",
        codeHash,
        expiresAt,
      },
    });

    await sendOtpCode({ email, code });

    return NextResponse.json({
      ok: true,
      message: "OTP sent successfully",
      devCode: process.env.NODE_ENV === "production" ? undefined : code,
    });
  } catch (error) {
    console.error(error);
    return serverError("Unable to send OTP");
  }
}

