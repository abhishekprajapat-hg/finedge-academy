import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      featuredImage: true,
      metaTitle: true,
      metaDescription: true,
      publishedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, posts });
}

