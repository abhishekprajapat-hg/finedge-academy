import Link from "next/link";
import Image from "next/image";
import { Course } from "@prisma/client";
import { ArrowRight, CirclePlay, Layers3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/format";

type CoursePreview = Pick<Course, "title" | "slug" | "description" | "pricePaise" | "thumbnailUrl"> & {
  lessonsCount?: number;
  previewLessonsCount?: number;
};

function isExternalUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

export function CourseCard({ course }: { course: CoursePreview }) {
  const lessonsCount = course.lessonsCount ?? 0;
  const previewLessonsCount = course.previewLessonsCount ?? 0;

  return (
    <Card className="group h-full overflow-hidden border-[#c6d8e9] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-38px_rgba(9,30,66,0.75)]">
      <div className="relative h-44 overflow-hidden">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            unoptimized={isExternalUrl(course.thumbnailUrl)}
          />
        ) : (
          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(125deg, #083043, #0f5161)" }} />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,27,42,0.08),rgba(6,25,39,0.7))]"
        />
        <div className="relative z-10 flex h-full flex-col justify-between p-3">
          <Badge className="w-fit border-white/25 bg-black/35 text-white">Self-Paced Program</Badge>
          <div className="flex flex-wrap gap-2">
            <Badge className="border-white/25 bg-white/20 text-white">
              <Layers3 className="mr-1 h-3.5 w-3.5" />
              {lessonsCount} lessons
            </Badge>
            {previewLessonsCount ? (
              <Badge className="border-white/25 bg-white/20 text-white">
                <CirclePlay className="mr-1 h-3.5 w-3.5" />
                {previewLessonsCount} preview
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      <CardHeader className="space-y-3 pb-3">
        <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
        <p className="line-clamp-3 text-sm text-[#4d6480]">{course.description}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-end justify-between rounded-xl border border-[#cde0ef] bg-[#f4f9ff] p-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#547693]">Program Fee</p>
            <p className="text-xl font-bold text-[#0d1b2a]">{formatINR(course.pricePaise)}</p>
          </div>
          <p className="text-xs text-[#5f7893]">One-time payment</p>
        </div>

        <Button asChild className="w-full">
          <Link href={`/courses/${course.slug}`} prefetch={false} className="flex items-center justify-center gap-2">
            View Curriculum
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

