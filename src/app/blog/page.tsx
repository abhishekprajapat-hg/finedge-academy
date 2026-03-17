import { Metadata } from "next";
import { BookOpenText } from "lucide-react";
import { BlogCard } from "@/components/blog/blog-card";
import { DatabaseUnavailable } from "@/components/layout/database-unavailable";
import { Disclaimer } from "@/components/layout/disclaimer";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Blog",
};

export const revalidate = 300;

export default async function BlogPage() {
  const { posts, dbUnavailable } = await (async () => {
    try {
      const items = await prisma.blogPost.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImage: true,
          publishedAt: true,
        },
      });

      return { posts: items, dbUnavailable: false };
    } catch {
      return {
        posts: [] as {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          featuredImage: string | null;
          publishedAt: Date | null;
        }[],
        dbUnavailable: true,
      };
    }
  })();

  return (
    <div className="page-shell">
      <div className="site-container space-y-8 py-12">
        <section className="hero-gradient hero-blog p-7 sm:p-8">
          <div className="relative z-10 space-y-4">
            <Badge className="hero-badge w-fit">Financial Education Blog</Badge>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">Insights built for practical money decisions.</h1>
            <p className="max-w-3xl text-sm leading-7 text-[#d4e8f4] sm:text-base">
              Read implementation-focused guides across investing, risk, insurance, and personal finance discipline.
            </p>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#d4e8f4]">
              <BookOpenText className="h-4 w-4 text-[#a6dfe9]" />
              Free content designed to move from theory to action.
            </p>
          </div>
        </section>

        {dbUnavailable ? (
          <DatabaseUnavailable context="blog posts" />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <Disclaimer />
      </div>
    </div>
  );
}

