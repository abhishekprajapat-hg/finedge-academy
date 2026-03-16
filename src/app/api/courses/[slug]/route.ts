import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;

  const course = await prisma.course.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    include: {
      lessons: {
        orderBy: { lessonOrder: "asc" },
      },
    },
  });

  if (!course) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const session = await getSessionFromRequest(request);

  const purchased = session?.sub
    ? await prisma.purchase.findUnique({
        where: {
          userId_courseId: {
            userId: session.sub,
            courseId: course.id,
          },
        },
      })
    : null;

  const canAccessAll = Boolean(purchased);

  return NextResponse.json({
    ok: true,
    course: {
      ...course,
      lessons: canAccessAll ? course.lessons : course.lessons.filter((lesson) => lesson.isPreview),
    },
    canAccessAll,
  });
}

