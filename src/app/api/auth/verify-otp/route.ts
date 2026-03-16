import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { sessionCookieOptions } from "@/lib/auth";
import { badRequest, serverError, unauthorized } from "@/lib/http";
import { signSessionToken } from "@/lib/jwt";
import { hashOtp } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import { normalizeEmailIdentifier, otpVerifySchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = otpVerifySchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid OTP verification payload", parsed.error.flatten());
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
        channel: "email",
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

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        fullName: parsed.data.fullName ?? undefined,
      },
      create: {
        email,
        fullName: parsed.data.fullName,
        role: Role.USER,
      },
    });

    await prisma.otpRequest.update({
      where: { id: otpRecord.id },
      data: {
        usedAt: new Date(),
        userId: user.id,
      },
    });

    const token = await signSessionToken({
      sub: user.id,
      role: user.role,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
    });

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

    response.cookies.set({
      ...sessionCookieOptions(),
      value: token,
    });

    return response;
  } catch (error) {
    console.error(error);
    return serverError("Unable to verify OTP");
  }
}

