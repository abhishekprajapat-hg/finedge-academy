import { NextResponse } from "next/server";
import { courseSchema } from "@/lib/validations/course";
import { badRequest, serverError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/route-guards";
import { toEmbeddableVideoUrl } from "@/lib/video";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  const courses = await prisma.course.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      lessons: {
        orderBy: { lessonOrder: "asc" },
      },
      purchases: true,
    },
  });

  return NextResponse.json({ ok: true, courses });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const parsed = courseSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid course payload", parsed.error.flatten());
    }

    const course = await prisma.course.create({
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

    return NextResponse.json({ ok: true, course }, { status: 201 });
  } catch (error) {
    console.error(error);
    return serverError("Unable to create course");
  }
}

