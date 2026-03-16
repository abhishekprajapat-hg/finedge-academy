import { NextResponse } from "next/server";
import { badRequest, serverError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/route-guards";
import { lessonProgressSchema } from "@/lib/validations/learning";

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth.error || !auth.session) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const parsed = lessonProgressSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid lesson progress payload", parsed.error.flatten());
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: parsed.data.lessonId },
      select: { id: true, courseId: true, isPreview: true },
    });

    if (!lesson) {
      return badRequest("Lesson not found");
    }

    const purchase = await prisma.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: auth.session.sub,
          courseId: lesson.courseId,
        },
      },
    });

    if (!purchase && !lesson.isPreview) {
      return NextResponse.json({ ok: false, error: "Course not purchased" }, { status: 403 });
    }

    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: auth.session.sub,
          lessonId: lesson.id,
        },
      },
      update: {
        completedAt: parsed.data.completed ? new Date() : null,
      },
      create: {
        userId: auth.session.sub,
        lessonId: lesson.id,
        completedAt: parsed.data.completed ? new Date() : null,
      },
    });

    return NextResponse.json({ ok: true, progress });
  } catch (error) {
    console.error(error);
    return serverError("Unable to update lesson progress");
  }
}

