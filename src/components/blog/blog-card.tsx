import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { BlogPost } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format";

type BlogPreview = Pick<BlogPost, "title" | "slug" | "excerpt" | "publishedAt" | "featuredImage">;

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

export function BlogCard({ post }: { post: BlogPreview }) {
  return (
    <Card className="h-full overflow-hidden border-[#c6d8e9] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_56px_-36px_rgba(9,30,66,0.75)]">
      <div className="relative h-40 overflow-hidden">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            unoptimized={isExternalUrl(post.featuredImage)}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "linear-gradient(125deg, #cde8f4, #d9f3f2)",
            }}
          />
        )}
      </div>
      <CardHeader>
        <p className="text-xs uppercase tracking-[0.12em] text-[#5f7893]">{post.publishedAt ? formatDate(post.publishedAt) : "Draft"}</p>
        <CardTitle className="line-clamp-2">{post.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="line-clamp-3 text-sm text-[#4d6480]">{post.excerpt}</p>
        <Link href={`/blog/${post.slug}`} prefetch={false} className="inline-flex items-center gap-1 text-sm font-semibold text-[#006d77] hover:text-[#0a4d5d]">
          Read article
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}

