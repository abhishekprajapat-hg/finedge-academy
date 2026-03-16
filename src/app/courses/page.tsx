import Link from "next/link";
import { Metadata } from "next";
import type { ComponentType } from "react";
import { ArrowRight, BookOpenText, CirclePlay, IndianRupee, ShieldCheck } from "lucide-react";
import { CourseCard } from "@/components/courses/course-card";
import { Disclaimer } from "@/components/layout/disclaimer";
import { DatabaseUnavailable } from "@/components/layout/database-unavailable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatINR } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Courses",
};

export const dynamic = "force-dynamic";

type CatalogCourse = {
  id: string;
  title: string;
  slug: string;
  description: string;
  pricePaise: number;
  thumbnailUrl: string | null;
  lessons: {
    id: string;
    isPreview: boolean;
  }[];
};

function HeroStat({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="metric-pill">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-[#d3ebf6]">
        <Icon className="h-4 w-4 text-[#a3deeb]" />
        {label}
      </div>
      <p className="mt-1 text-xl font-bold text-white">{value}</p>
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[#d7eff9]">{label}</span>;
}

export default async function CoursesPage() {
  let courses: CatalogCourse[] = [];
  let dbUnavailable = false;

  try {
    courses = await prisma.course.findMany({
      where: { isPublished: true },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        pricePaise: true,
        thumbnailUrl: true,
        lessons: {
          select: {
            id: true,
            isPreview: true,
          },
        },
      },
    });
  } catch {
    dbUnavailable = true;
  }

  const totalLessons = courses.reduce((sum, course) => sum + course.lessons.length, 0);
  const totalPreviewLessons = courses.reduce((sum, course) => sum + course.lessons.filter((lesson) => lesson.isPreview).length, 0);
  const averageTicketPaise = courses.length ? Math.round(courses.reduce((sum, course) => sum + course.pricePaise, 0) / courses.length) : 0;

  return (
    <div className="page-shell">
      <div className="site-container space-y-10 py-12">
        <section className="hero-gradient hero-courses p-7 sm:p-8">
          <div className="relative z-10 space-y-5">
            <Badge className="border-white/25 bg-white/10 text-white">FinEdge Learning Programs</Badge>

            <div className="space-y-3">
              <h1 className="max-w-4xl text-3xl font-bold leading-tight text-white sm:text-4xl">
                Professional finance courses built for real market decisions.
              </h1>
              <p className="max-w-3xl text-sm text-[#d4e8f4] sm:text-base">
                Structured modules, action-oriented lessons, and direct implementation frameworks. Start with preview lessons and move to full mastery.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <HeroStat icon={BookOpenText} label="Programs" value={String(courses.length)} />
              <HeroStat icon={CirclePlay} label="Total Lessons" value={String(totalLessons)} />
              <HeroStat icon={IndianRupee} label="Avg Ticket" value={averageTicketPaise ? formatINR(averageTicketPaise) : "-"} />
              <HeroStat icon={ShieldCheck} label="Free Previews" value={String(totalPreviewLessons)} />
            </div>

            <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
              <Tag label="Beginner-friendly structure" />
              <Tag label="Preview before you buy" />
              <Tag label="Self-paced learning" />
              <Tag label="Execution-focused modules" />
            </div>
          </div>
        </section>

        {dbUnavailable ? (
          <DatabaseUnavailable context="courses" />
        ) : courses.length ? (
          <>
            <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={{
                    ...course,
                    lessonsCount: course.lessons.length,
                    previewLessonsCount: course.lessons.filter((lesson) => lesson.isPreview).length,
                  }}
                />
              ))}
            </section>

            <Card className="border-[#c6d8e9] bg-[linear-gradient(90deg,#e7f4f6_0%,#ffffff_50%,#edf6ff_100%)]">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-lg font-bold text-[#0d1b2a]">Need help choosing the right course track?</p>
                  <p className="text-sm text-[#4d6480]">Start with preview lessons and then unlock the complete roadmap.</p>
                </div>
                <Button asChild>
                  <Link href="/contact" className="flex items-center gap-2">
                    Talk to Team
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="p-6 text-sm text-[#4d6480]">No published courses available right now.</CardContent>
          </Card>
        )}

        <Disclaimer />
      </div>
    </div>
  );
}
