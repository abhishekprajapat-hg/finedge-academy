import { type Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { sessionCookieOptions } from "@/lib/auth";
import { signSessionToken } from "@/lib/jwt";

type SessionUser = {
  id: string;
  role: Role;
  email: string | null;
  phone: string | null;
  fullName: string | null;
};

export async function buildSessionResponse(user: SessionUser) {
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
}
