import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SessionPayload, verifySessionToken } from "@/lib/jwt";

export const SESSION_COOKIE = "fin_edu_session";
export type SessionUser = {
  id: string;
  role: "USER" | "ADMIN";
  email: string | null;
  phone: string | null;
  fullName: string | null;
};

export async function getSessionFromRequest(request: Request): Promise<SessionPayload | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  if (!token) {
    return null;
  }

  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function getSessionUserFromCookies(): Promise<SessionUser | null> {
  const session = await getSessionFromCookies();
  if (!session?.sub || !session.role) {
    return null;
  }

  return {
    id: session.sub,
    role: session.role,
    email: session.email ?? null,
    phone: session.phone ?? null,
    fullName: session.fullName ?? null,
  };
}

export async function getCurrentUser() {
  const session = await getSessionFromCookies();
  if (!session?.sub) {
    return null;
  }

  try {
    return await prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch {
    // Keep public pages usable even when DB is temporarily unavailable.
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    name: SESSION_COOKIE,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

