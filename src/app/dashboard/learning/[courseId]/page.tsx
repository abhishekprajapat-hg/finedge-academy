import Link from "next/link";
import { redirect } from "next/navigation";
import type { ComponentType } from "react";
import { ArrowRight, BookOpenCheck, CirclePlay, Lock, Sparkles } from "lucide-react";
import { LessonCompleteButton } from "@/components/dashboard/lesson-complete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function CourseLearningPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/dashboard/learning/${courseId}`)}`);
  }

  const [course, purchase] = await Promise.all([
    prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { lessonOrder: "asc" },
        },
      },
    }),
    prisma.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    }),
  ]);

  if (!course) {
    redirect("/courses");
  }

  const purchased = Boolean(purchase);
  const visibleLessons = purchased ? course.lessons : course.lessons.filter((lesson) => lesson.isPreview);

  if (!purchased && !visibleLessons.length) {
    redirect(`/courses/${course.slug}`);
  }

  const progress = await prisma.lessonProgress.findMany({
    where: {
      userId: user.id,
      lesson: {
        courseId,
      },
    },
  });

  const progressMap = new Map(progress.map((item) => [item.lessonId, Boolean(item.completedAt)]));
  const completedLessons = visibleLessons.filter((lesson) => progressMap.get(lesson.id)).length;
  const progressPercent = visibleLessons.length ? Math.round((completedLessons / visibleLessons.length) * 100) : 0;
  const nextLesson = visibleLessons.find((lesson) => !progressMap.get(lesson.id)) || visibleLessons[0] || null;
  const previewLessonsCount = course.lessons.filter((lesson) => lesson.isPreview).length;
  const lockedLessonsCount = Math.max(0, course.lessons.length - visibleLessons.length);

  return (
    <div className="page-shell">
      <div className="site-container space-y-8 py-12">
        <section className="hero-gradient hero-learning p-6 text-white sm:p-8">
          <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#91d7e2]/20 blur-3xl" />

          <div className="relative z-10 space-y-4">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[#d4e8f4] transition hover:text-white">
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to Dashboard
            </Link>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{course.title}</h1>
              <p className="max-w-3xl text-sm text-[#d4e8f4] sm:text-base">
                {purchased
                  ? "Track your lesson progress and stay consistent until completion."
                  : "Preview available lessons now. Unlock full access to continue complete learning path."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {purchased ? <Badge className="bg-[#e2f5f4] text-[#055b64]">Full Access</Badge> : <Badge variant="warning">Preview Mode</Badge>}
              <Badge className="bg-white/10 text-white">{visibleLessons.length} visible lessons</Badge>
              <Badge className="bg-white/10 text-white">{completedLessons} completed</Badge>
              {!purchased ? <Badge className="bg-white/10 text-white">{lockedLessonsCount} locked</Badge> : null}
            </div>

            <div className="flex flex-wrap gap-3">
              {nextLesson ? (
                <Button asChild variant="secondary">
                  <Link href={`/dashboard/learning/${course.id}/lesson/${nextLesson.id}`} className="flex items-center gap-2">
                    Continue Learning
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
              <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
                <Link href={`/courses/${course.slug}`}>Open Course Detail</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Course Progress" value={`${progressPercent}%`} hint={`${completedLessons}/${visibleLessons.length} completed`} icon={BookOpenCheck} />
        <MetricCard label="Preview Lessons" value={String(previewLessonsCount)} hint="Watch before you buy" icon={CirclePlay} />
        <MetricCard
          label={purchased ? "Access" : "Locked Content"}
          value={purchased ? "Full" : String(lockedLessonsCount)}
          hint={purchased ? "All lessons unlocked" : "Lessons locked until enrollment"}
          icon={Lock}
        />
        </section>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-[#d1e1ef] bg-[#f4f9ff]">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-[#006d77]" />
              {purchased ? "Learning Curriculum" : "Preview Curriculum"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
          {visibleLessons.map((lesson, index) => {
            const completed = progressMap.get(lesson.id) ?? false;
            const isNext = nextLesson?.id === lesson.id;

            return (
              <div
                key={lesson.id}
                className="rounded-xl border border-[#d1e1ef] p-4 transition hover:border-[#8eb8d9] hover:bg-[#f3f9ff]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#edf5ff] text-xs font-semibold text-[#3d5f80]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="space-y-1">
                      <Link
                        href={`/dashboard/learning/${courseId}/lesson/${lesson.id}`}
                        className="text-base font-semibold text-[#006d77] hover:text-[#0a4d5d]"
                      >
                        {lesson.title}
                      </Link>
                      <p className="text-sm text-[#4d6480]">{lesson.description || "Focused lesson in this module."}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {lesson.isPreview ? <Badge variant="neutral">Preview</Badge> : null}
                    {isNext && !completed ? <Badge variant="warning">Up Next</Badge> : null}
                    {completed ? <Badge>Completed</Badge> : null}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/learning/${courseId}/lesson/${lesson.id}`}>Open Lesson</Link>
                  </Button>
                  {purchased ? <LessonCompleteButton lessonId={lesson.id} completed={completed} /> : null}
                </div>
              </div>
            );
          })}
          </CardContent>
        </Card>

        {!purchased ? (
          <Card className="border-[#d1e1ef] bg-[linear-gradient(90deg,#fff5df_0%,#ffffff_44%,#e8f8f7_100%)]">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="font-semibold text-[#0d1b2a]">Unlock full course to continue after preview</p>
                <p className="text-sm text-[#4d6480]">You currently have access to {visibleLessons.length} preview lessons.</p>
              </div>
              <Button asChild>
                <Link href={`/courses/${course.slug}`}>Upgrade Now</Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-[#c6d8e9]">
      <CardContent className="space-y-1 p-5">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-[#5f7893]">
          <Icon className="h-4 w-4 text-[#006d77]" />
          {label}
        </p>
        <p className="text-3xl font-bold text-[#0d1b2a]">{value}</p>
        <p className="text-sm text-[#4d6480]">{hint}</p>
      </CardContent>
    </Card>
  );
}
