import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/route-guards";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  const [totalUsers, totalLeads, courseSales, revenueAgg, topLeadSources] = await Promise.all([
    prisma.user.count(),
    prisma.lead.count(),
    prisma.purchase.count({ where: { status: "PAID" } }),
    prisma.purchase.aggregate({
      where: { status: "PAID" },
      _sum: { amountPaise: true },
    }),
    prisma.lead.groupBy({
      by: ["source"],
      _count: { source: true },
      orderBy: {
        _count: {
          source: "desc",
        },
      },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    ok: true,
    analytics: {
      totalUsers,
      totalLeads,
      courseSales,
      revenuePaise: revenueAgg._sum.amountPaise ?? 0,
      topLeadSources,
    },
  });
}

