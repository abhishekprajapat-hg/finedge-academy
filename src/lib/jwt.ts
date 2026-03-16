import { SignJWT, jwtVerify } from "jose";
import { env } from "@/lib/env";

const secret = new TextEncoder().encode(env.JWT_SECRET);

export type SessionPayload = {
  sub: string;
  role: "USER" | "ADMIN";
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
};

export async function signSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .sign(secret);
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as SessionPayload;
}

