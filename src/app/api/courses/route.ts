import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    include: {
      lessons: {
        orderBy: { lessonOrder: "asc" },
      },
    },
  });

  return NextResponse.json(
    { ok: true, courses },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
      },
    },
  );
}

