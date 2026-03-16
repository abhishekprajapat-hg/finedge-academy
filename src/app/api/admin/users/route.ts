import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/route-guards";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      financialProfiles: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          category: true,
          weightedScore: true,
          createdAt: true,
        },
      },
    },
  });

  return NextResponse.json({ ok: true, users });
}

