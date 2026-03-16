import { NextResponse } from "next/server";
import { blogPostSchema } from "@/lib/validations/blog";
import { badRequest, serverError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/route-guards";

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  const posts = await prisma.blogPost.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ ok: true, posts });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (auth.error || !auth.session) {
    return auth.error;
  }

  try {
    const body = await request.json();
    const parsed = blogPostSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid blog post payload", parsed.error.flatten());
    }

    const post = await prisma.blogPost.create({
      data: {
        ...parsed.data,
        excerpt: parsed.data.excerpt || null,
        featuredImage: parsed.data.featuredImage || null,
        metaTitle: parsed.data.metaTitle || null,
        metaDescription: parsed.data.metaDescription || null,
        publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
        authorId: auth.session.sub,
      },
    });

    return NextResponse.json({ ok: true, post }, { status: 201 });
  } catch (error) {
    console.error(error);
    return serverError("Unable to create blog post");
  }
}

