import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { badRequest, serverError, tooManyRequests } from "@/lib/http";
import { generateOtpCode, hashOtp, sendOtpCode } from "@/lib/otp";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import { normalizeEmailIdentifier, registerRequestSchema } from "@/lib/validations/auth";

const OTP_TTL_MINUTES = 10;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerRequestSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid registration payload", parsed.error.flatten());
    }

    let email: string;
    try {
      email = normalizeEmailIdentifier(parsed.data.email);
    } catch (error) {
      return badRequest(error instanceof Error ? error.message : "Invalid email");
    }

    const ip = requestIp(request);
    const limiter = rateLimit(`register-otp:${ip}:${email}`, { limit: 5, windowMs: 10 * 60 * 1000 });
    if (limiter.limited) {
      return tooManyRequests(limiter.resetInSeconds, "Too many OTP requests. Try again later.");
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        role: true,
        emailVerifiedAt: true,
      },
    });

    if (existingUser?.role === Role.ADMIN) {
      return badRequest("This email cannot be used for member registration.");
    }

    if (existingUser?.emailVerifiedAt) {
      return badRequest("Account already exists. Please login.");
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const code = generateOtpCode();
    const codeHash = hashOtp(email, code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      const user = existingUser
        ? await tx.user.update({
            where: { id: existingUser.id },
            data: {
              fullName: parsed.data.fullName,
              passwordHash,
              role: Role.USER,
            },
            select: { id: true },
          })
        : await tx.user.create({
            data: {
              fullName: parsed.data.fullName,
              email,
              passwordHash,
              role: Role.USER,
            },
            select: { id: true },
          });

      await tx.otpRequest.create({
        data: {
          identifier: email,
          channel: "register",
          codeHash,
          expiresAt,
          userId: user.id,
        },
      });
    });

    await sendOtpCode({ email, code, purpose: "register" });

    return NextResponse.json({
      ok: true,
      message: "OTP sent to your email.",
      devCode: process.env.NODE_ENV === "production" ? undefined : code,
    });
  } catch (error) {
    console.error(error);
    return serverError("Unable to send registration OTP");
  }
}
