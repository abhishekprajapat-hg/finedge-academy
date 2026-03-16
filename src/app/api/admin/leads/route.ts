import { LeadStatus, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { badRequest, serverError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/route-guards";

const updateLeadSchema = z.object({
  id: z.string().cuid(),
  status: z.nativeEnum(LeadStatus).optional(),
  isHot: z.boolean().optional(),
  message: z.string().max(1000).optional(),
});

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source");
    const interestArea = searchParams.get("interestArea");
    const sort = searchParams.get("sort") === "asc" ? "asc" : "desc";

    const where: Prisma.LeadWhereInput = {
      ...(source ? { source } : {}),
      ...(interestArea ? { interestArea } : {}),
    };

    const leads = await prisma.lead.findMany({
      where,
      orderBy: {
        createdAt: sort,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      leads,
    });
  } catch (error) {
    console.error(error);
    return serverError("Unable to fetch leads");
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const parsed = updateLeadSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid lead update payload", parsed.error.flatten());
    }

    const lead = await prisma.lead.update({
      where: { id: parsed.data.id },
      data: {
        status: parsed.data.status,
        isHot: parsed.data.isHot,
        message: parsed.data.message,
      },
    });

    return NextResponse.json({ ok: true, lead });
  } catch (error) {
    console.error(error);
    return serverError("Unable to update lead");
  }
}

