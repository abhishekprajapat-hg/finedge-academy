-- AlterTable
ALTER TABLE "User"
ADD COLUMN "passwordHash" TEXT,
ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);

-- Existing OTP users are considered verified in the previous auth flow.
UPDATE "User"
SET "emailVerifiedAt" = COALESCE("emailVerifiedAt", "createdAt")
WHERE "email" IS NOT NULL;
