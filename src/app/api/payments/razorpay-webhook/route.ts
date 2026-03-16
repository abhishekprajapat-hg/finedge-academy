import { badRequest } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return badRequest("Missing Razorpay signature header");
  }

  const rawBody = await request.text();
  const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
  if (!isValid) {
    return badRequest("Invalid webhook signature");
  }

  const payload = JSON.parse(rawBody) as {
    event: string;
    payload?: {
      payment?: { entity?: { order_id?: string; id?: string } };
      order?: { entity?: { id?: string } };
    };
  };

  const providerRef =
    payload.payload?.payment?.entity?.order_id || payload.payload?.order?.entity?.id || null;

  if (!providerRef) {
    return Response.json({ ok: true, ignored: true });
  }

  const paymentOrder = await prisma.paymentOrder.findUnique({
    where: { providerRef },
  });

  if (!paymentOrder) {
    return Response.json({ ok: true, ignored: true });
  }

  if (payload.event === "payment.captured" || payload.event === "order.paid") {
    await prisma.$transaction(async (tx) => {
      await tx.paymentOrder.update({
        where: { id: paymentOrder.id },
        data: {
          status: "PAID",
          paymentId: payload.payload?.payment?.entity?.id,
          signature,
          payload: payload as unknown as object,
        },
      });

      await tx.purchase.upsert({
        where: {
          userId_courseId: {
            userId: paymentOrder.userId,
            courseId: paymentOrder.courseId,
          },
        },
        update: {
          amountPaise: paymentOrder.amountPaise,
          status: "PAID",
          paymentOrderId: paymentOrder.id,
        },
        create: {
          userId: paymentOrder.userId,
          courseId: paymentOrder.courseId,
          amountPaise: paymentOrder.amountPaise,
          status: "PAID",
          paymentOrderId: paymentOrder.id,
        },
      });
    });
  }

  if (payload.event === "payment.failed") {
    await prisma.paymentOrder.update({
      where: { id: paymentOrder.id },
      data: {
        status: "FAILED",
        signature,
        payload: payload as unknown as object,
      },
    });
  }

  return Response.json({ ok: true });
}

