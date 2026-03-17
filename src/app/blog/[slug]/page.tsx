import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { DatabaseUnavailable } from "@/components/layout/database-unavailable";
import { Disclaimer } from "@/components/layout/disclaimer";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true },
    });

    return posts.map((post) => ({ slug: post.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost
    .findUnique({
      where: { slug },
      select: {
        title: true,
        metaTitle: true,
        excerpt: true,
        metaDescription: true,
      },
    })
    .catch(() => null);

  if (!post) {
    return {
      title: "Blog Post",
    };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || undefined,
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { post, dbUnavailable } = await (async () => {
    try {
      const article = await prisma.blogPost.findFirst({
        where: {
          slug,
          status: "PUBLISHED",
        },
      });

      return { post: article, dbUnavailable: false };
    } catch {
      return { post: null, dbUnavailable: true };
    }
  })();

  if (dbUnavailable) {
    return (
      <div className="site-container py-10">
        <DatabaseUnavailable context="this blog article" />
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  const imageIsExternal = post.featuredImage ? /^https?:\/\//i.test(post.featuredImage) : false;

  return (
    <div className="page-shell">
      <div className="site-container py-12">
        <article className="mx-auto max-w-4xl space-y-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#006d77] hover:text-[#0a4d5d]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blogs
          </Link>

          <section className="hero-gradient hero-blog-detail p-6 sm:p-7">
            <div className="relative z-10 space-y-3">
              <p className="text-xs uppercase tracking-[0.12em] text-[#d4e8f4]">{post.publishedAt ? formatDate(post.publishedAt) : "Draft"}</p>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{post.title}</h1>
              <p className="text-sm leading-7 text-[#d4e8f4] sm:text-base">{post.excerpt}</p>
            </div>
          </section>

          {post.featuredImage ? (
            <div className="relative h-64 overflow-hidden rounded-2xl border border-[#c6d8e9]">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                sizes="(min-width: 1024px) 896px, 100vw"
                className="object-cover"
                unoptimized={imageIsExternal}
              />
            </div>
          ) : null}

          <Card>
            <CardContent className="prose prose-slate max-w-none p-6 text-[#243d58]">
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-[#006d77] hover:text-[#0a4d5d]">
              Explore Recommended Courses
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-[#006d77] hover:text-[#0a4d5d]">
              Book Consultation
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <Disclaimer />
        </article>
      </div>
    </div>
  );
}
