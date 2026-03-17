import { prisma } from "@/lib/prisma";

type EmailVerificationRow = {
  emailVerifiedAt: Date | null;
};

type PasswordHashRow = {
  passwordHash: string | null;
};

export async function getEmailVerifiedAtByUserId(userId: string): Promise<Date | null> {
  const rows = await prisma.$queryRaw<EmailVerificationRow[]>`
    SELECT "emailVerifiedAt"
    FROM "User"
    WHERE "id" = ${userId}
    LIMIT 1
  `;

  return rows[0]?.emailVerifiedAt ?? null;
}

export async function markEmailVerifiedByUserId(userId: string, at: Date = new Date()) {
  await prisma.$executeRaw`
    UPDATE "User"
    SET "emailVerifiedAt" = ${at}
    WHERE "id" = ${userId}
  `;
}

export async function getPasswordHashByUserId(userId: string): Promise<string | null> {
  const rows = await prisma.$queryRaw<PasswordHashRow[]>`
    SELECT "passwordHash"
    FROM "User"
    WHERE "id" = ${userId}
    LIMIT 1
  `;

  return rows[0]?.passwordHash ?? null;
}

export async function updatePasswordHashByUserId(userId: string, passwordHash: string) {
  await prisma.$executeRaw`
    UPDATE "User"
    SET "passwordHash" = ${passwordHash}
    WHERE "id" = ${userId}
  `;
}
