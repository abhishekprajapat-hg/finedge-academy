import { NextResponse } from "next/server";
import { blogPostSchema } from "@/lib/validations/blog";
import { badRequest, serverError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/route-guards";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  const { id } = await context.params;
  const post = await prisma.blogPost.findUnique({ where: { id } });

  if (!post) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, post });
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth.error || !auth.session) {
    return auth.error;
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = blogPostSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Invalid blog post payload", parsed.error.flatten());
    }

    const post = await prisma.blogPost.update({
      where: { id },
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

    return NextResponse.json({ ok: true, post });
  } catch (error) {
    console.error(error);
    return serverError("Unable to update blog post");
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth.error) {
    return auth.error;
  }

  try {
    const { id } = await context.params;
    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return serverError("Unable to delete blog post");
  }
}

