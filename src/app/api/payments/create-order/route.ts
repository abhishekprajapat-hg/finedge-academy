import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { badRequest, serverError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getRazorpayClient, hasRazorpayConfigured } from "@/lib/razorpay";
import { requireAuth } from "@/lib/route-guards";
import { createPaymentOrderSchema } from "@/lib/validations/payment";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth.error || !auth.session) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const parsed = createPaymentOrderSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid payment order payload", parsed.error.flatten());
    }

    const course = await prisma.course.findUnique({
      where: { id: parsed.data.courseId },
    });

    if (!course || !course.isPublished) {
      return badRequest("Course is not available for purchase");
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
      return badRequest("Course already purchased");
    }

    if (!hasRazorpayConfigured()) {
      return NextResponse.json(
        {
          ok: false,
          error: "Razorpay is not configured. Add API keys in .env.",
        },
        { status: 503 },
      );
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: course.pricePaise,
      currency: "INR",
      receipt: `course_${course.id}_${Date.now()}`,
      notes: {
        courseId: course.id,
        userId: auth.session.sub,
      },
    });

    const paymentOrder = await prisma.paymentOrder.create({
      data: {
        userId: auth.session.sub,
        courseId: course.id,
        providerRef: order.id,
        amountPaise: course.pricePaise,
        currency: order.currency,
        status: "CREATED",
        payload: order as unknown as object,
      },
    });

    return NextResponse.json({
      ok: true,
      keyId: env.RAZORPAY_KEY_ID,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      paymentOrderId: paymentOrder.id,
    });
  } catch (error) {
    console.error(error);
    return serverError("Unable to create payment order");
  }
}

