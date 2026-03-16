import { createHash, timingSafeEqual } from "node:crypto";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { sessionCookieOptions } from "@/lib/auth";
import { adminLoginConfig } from "@/lib/env";
import { badRequest, serverError, tooManyRequests, unauthorized } from "@/lib/http";
import { signSessionToken } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import { adminLoginSchema } from "@/lib/validations/auth";

function safeCompare(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = adminLoginSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid admin login payload", parsed.error.flatten());
    }

    if (!adminLoginConfig.email || !adminLoginConfig.password) {
      return serverError("Admin login is not configured. Set ADMIN_LOGIN_EMAIL and ADMIN_LOGIN_PASSWORD.");
    }

    const ip = requestIp(request);
    const limiter = rateLimit(`admin-login:${ip}`, { limit: 6, windowMs: 10 * 60 * 1000 });
    if (limiter.limited) {
      return tooManyRequests(limiter.resetInSeconds, "Too many admin login attempts. Try again later.");
    }

    const emailMatches = safeCompare(parsed.data.email, adminLoginConfig.email);
    const passwordMatches = safeCompare(parsed.data.password, adminLoginConfig.password);

    if (!emailMatches || !passwordMatches) {
      return unauthorized("Invalid admin credentials");
    }

    const user = await prisma.user.upsert({
      where: { email: adminLoginConfig.email },
      update: {
        role: Role.ADMIN,
        fullName: adminLoginConfig.name,
      },
      create: {
        email: adminLoginConfig.email,
        role: Role.ADMIN,
        fullName: adminLoginConfig.name,
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
    return serverError("Unable to login as admin");
  }
}
