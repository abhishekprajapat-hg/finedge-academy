import { NextResponse } from "next/server";
import { courseSchema } from "@/lib/validations/course";
import { badRequest, serverError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/route-guards";
import { toEmbeddableVideoUrl } from "@/lib/video";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  const { id } = await context.params;
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      lessons: {
        orderBy: { lessonOrder: "asc" },
      },
    },
  });

  if (!course) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, course });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = courseSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid course payload", parsed.error.flatten());
    }

    const course = await prisma.$transaction(async (tx) => {
      await tx.lesson.deleteMany({ where: { courseId: id } });

      return tx.course.update({
        where: { id },
        data: {
          title: parsed.data.title,
          slug: parsed.data.slug,
          description: parsed.data.description,
          pricePaise: parsed.data.pricePaise,
          thumbnailUrl: parsed.data.thumbnailUrl || null,
          isPublished: parsed.data.isPublished,
          lessons: {
            create: parsed.data.lessons.map((lesson) => ({
              title: lesson.title,
              description: lesson.description,
              lessonOrder: lesson.lessonOrder,
              videoUrl: toEmbeddableVideoUrl(lesson.videoUrl),
              isPreview: lesson.isPreview,
            })),
          },
        },
        include: {
          lessons: {
            orderBy: { lessonOrder: "asc" },
          },
        },
      });
    });

    return NextResponse.json({ ok: true, course });
  } catch (error) {
    console.error(error);
    return serverError("Unable to update course");
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const { id } = await context.params;
    await prisma.course.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return serverError("Unable to delete course");
  }
}

