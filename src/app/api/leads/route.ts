import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getSessionFromRequest } from "@/lib/auth";
import { badRequest, serverError, tooManyRequests } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { rateLimit, requestIp } from "@/lib/rate-limit";
import { leadCaptureSchema } from "@/lib/validations/lead";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = leadCaptureSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid lead payload", parsed.error.flatten());
    }

    const ip = requestIp(request);
    const limiter = rateLimit(`lead:${ip}`, { limit: 8, windowMs: 10 * 60 * 1000 });
    if (limiter.limited) {
      return tooManyRequests(limiter.resetInSeconds, "Too many submissions. Try again later.");
    }

    const session = await getSessionFromRequest(request);

    const lead = await prisma.lead.create({
      data: {
        fullName: parsed.data.fullName,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        interestArea: parsed.data.interestArea,
        source: parsed.data.source,
        message: parsed.data.message,
        isHot: Boolean(parsed.data.isHot),
        metadata: parsed.data.metadata as Prisma.InputJsonValue | undefined,
        userId: session?.sub,
      },
    });

    return NextResponse.json({
      ok: true,
      leadId: lead.id,
    });
  } catch (error) {
    console.error(error);
    return serverError("Unable to capture lead");
  }
}

