import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { affiliatePartners } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requestIp } from "@/lib/rate-limit";

export async function GET(request: Request, context: { params: Promise<{ partnerKey: string }> }) {
  const { partnerKey } = await context.params;
  const partner = affiliatePartners.find((item) => item.key === partnerKey);

  if (!partner) {
    return NextResponse.redirect(new URL("/brokerage", request.url));
  }

  const session = await getSessionFromRequest(request);

  await prisma.affiliateClick.create({
    data: {
      partnerKey: partner.key,
      sourcePage: new URL(request.url).searchParams.get("source") || "unknown",
      destinationUrl: partner.destinationUrl,
      ipAddress: requestIp(request),
      userAgent: request.headers.get("user-agent"),
      userId: session?.sub,
    },
  });

  return NextResponse.redirect(partner.destinationUrl);
}

