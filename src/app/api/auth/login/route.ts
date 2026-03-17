import { getEmailVerifiedAtByUserId } from "@/lib/email-verification";
import { badRequest, serverError, tooManyRequests, unauthorized } from "@/lib/http";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import { buildSessionResponse } from "@/lib/session-response";
import { loginSchema, normalizeEmailIdentifier } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid login payload", parsed.error.flatten());
    }

    let email: string;
    try {
      email = normalizeEmailIdentifier(parsed.data.email);
    } catch (error) {
      return badRequest(error instanceof Error ? error.message : "Invalid email");
    }

    const ip = requestIp(request);
    const limiter = rateLimit(`login:${ip}:${email}`, { limit: 8, windowMs: 10 * 60 * 1000 });
    if (limiter.limited) {
      return tooManyRequests(limiter.resetInSeconds, "Too many login attempts. Try again later.");
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

    if (!user) {
      return unauthorized("Invalid email or password");
    }

    if (!user.passwordHash) {
      return unauthorized("Password not set for this account. Use Forgot Password to create one.");
    }

    const passwordMatches = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!passwordMatches) {
      return unauthorized("Invalid email or password");
    }

    const emailVerifiedAt = await getEmailVerifiedAtByUserId(user.id);
    if (!emailVerifiedAt) {
      return unauthorized("Email not verified. Complete registration OTP first.");
    }

    return buildSessionResponse({
      id: user.id,
      role: user.role,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
    });
  } catch (error) {
    console.error(error);
    return serverError("Unable to login");
  }
}
