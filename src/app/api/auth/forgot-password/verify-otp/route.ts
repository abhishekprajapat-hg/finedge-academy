import { NextResponse } from "next/server";
import { badRequest, serverError, unauthorized } from "@/lib/http";
import { hashOtp } from "@/lib/otp";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { forgotPasswordVerifySchema, normalizeEmailIdentifier } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = forgotPasswordVerifySchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid password reset payload", parsed.error.flatten());
    }

    let email: string;
    try {
      email = normalizeEmailIdentifier(parsed.data.email);
    } catch (error) {
      return badRequest(error instanceof Error ? error.message : "Invalid email");
    }

    const otpRecord = await prisma.otpRequest.findFirst({
      where: {
        identifier: email,
        channel: "reset_password",
        usedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return unauthorized("OTP not found");
    }

    if (otpRecord.expiresAt < new Date()) {
      return unauthorized("OTP expired. Please request a new one.");
    }

    if (otpRecord.attempts >= 5) {
      return unauthorized("Too many invalid OTP attempts. Request a new OTP.");
    }

    const incomingHash = hashOtp(email, parsed.data.code);
    if (incomingHash !== otpRecord.codeHash) {
      await prisma.otpRequest.update({
        where: { id: otpRecord.id },
        data: {
          attempts: { increment: 1 },
        },
      });
      return unauthorized("Invalid OTP code");
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        emailVerifiedAt: true,
      },
    });

    if (!user?.emailVerifiedAt) {
      return unauthorized("Account not found");
    }

    const newPasswordHash = await hashPassword(parsed.data.password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newPasswordHash,
        },
      }),
      prisma.otpRequest.update({
        where: { id: otpRecord.id },
        data: {
          usedAt: new Date(),
          userId: user.id,
        },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      message: "Password changed successfully. Please login with your new password.",
    });
  } catch (error) {
    console.error(error);
    return serverError("Unable to reset password");
  }
}
