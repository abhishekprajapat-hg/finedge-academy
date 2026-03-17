import { prisma } from "@/lib/prisma";

type EmailVerificationRow = {
  emailVerifiedAt: Date | null;
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
