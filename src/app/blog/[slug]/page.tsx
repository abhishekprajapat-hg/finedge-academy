import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { DatabaseUnavailable } from "@/components/layout/database-unavailable";
import { LeadCaptureForm } from "@/components/forms/lead-capture-form";
import { Disclaimer } from "@/components/layout/disclaimer";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } }).catch(() => null);

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

  return (
    <div className="page-shell">
      <div className="site-container grid gap-8 py-12 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="space-y-6">
          <section className="hero-gradient hero-blog-detail p-6 sm:p-7">
            <div className="relative z-10 space-y-3">
              <p className="text-xs uppercase tracking-[0.12em] text-[#d4e8f4]">{post.publishedAt ? formatDate(post.publishedAt) : "Draft"}</p>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{post.title}</h1>
              <p className="text-sm leading-7 text-[#d4e8f4] sm:text-base">{post.excerpt}</p>
            </div>
          </section>

          {post.featuredImage ? (
            <div className="h-64 rounded-2xl border border-[#c6d8e9] bg-cover bg-center" style={{ backgroundImage: `url(${post.featuredImage})` }} />
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

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <LeadCaptureForm source={`Blog Post: ${post.title}`} defaultInterest="Consultation" title="Need Guidance on This Topic?" />
        </div>
      </div>
    </div>
  );
}
