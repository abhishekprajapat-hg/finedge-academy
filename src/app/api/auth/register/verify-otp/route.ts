import { badRequest, serverError, unauthorized } from "@/lib/http";
import { hashOtp } from "@/lib/otp";
import { prisma } from "@/lib/prisma";
import { buildSessionResponse } from "@/lib/session-response";
import { normalizeEmailIdentifier, registerOtpVerifySchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerOtpVerifySchema.safeParse(body);

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
        channel: "register",
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
        fullName: true,
        email: true,
        phone: true,
        role: true,
        passwordHash: true,
      },
    });

    if (!user?.passwordHash) {
      return unauthorized("Registration not found. Please register again.");
    }

    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
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

    return buildSessionResponse(updatedUser);
  } catch (error) {
    console.error(error);
    return serverError("Unable to verify registration OTP");
  }
}
