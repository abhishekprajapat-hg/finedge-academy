import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/route-guards";
import { buildCsv } from "@/lib/utils";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  const leads = await prisma.lead.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const csv = buildCsv(
    leads.map((lead) => ({
      id: lead.id,
      createdAt: lead.createdAt.toISOString(),
      fullName: lead.fullName,
      email: lead.email ?? "",
      phone: lead.phone ?? "",
      interestArea: lead.interestArea,
      source: lead.source,
      status: lead.status,
      isHot: lead.isHot,
      message: lead.message ?? "",
    })),
  );

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

