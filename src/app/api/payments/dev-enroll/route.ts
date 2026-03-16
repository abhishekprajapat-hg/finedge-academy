import { NextResponse } from "next/server";
import { badRequest, forbidden, serverError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/route-guards";
import { createPaymentOrderSchema } from "@/lib/validations/payment";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth.error || !auth.session) {
    return auth.error;
  }

  if (process.env.NODE_ENV === "production") {
    return forbidden("Test enrollment is disabled in production.");
  }

  try {
    const body = await request.json();
    const parsed = createPaymentOrderSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid test enrollment payload", parsed.error.flatten());
    }

    const course = await prisma.course.findUnique({
      where: { id: parsed.data.courseId },
    });

    if (!course || !course.isPublished) {
      return badRequest("Course is not available");
    }

    const existing = await prisma.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: auth.session.sub,
          courseId: course.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        ok: true,
        alreadyPurchased: true,
      });
    }

    await prisma.purchase.create({
      data: {
        userId: auth.session.sub,
        courseId: course.id,
        amountPaise: course.pricePaise,
        status: "PAID",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return serverError("Unable to complete test enrollment");
  }
}
