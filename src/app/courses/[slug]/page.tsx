import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ArrowRight, CheckCircle2, Lock, PlayCircle, Sparkles } from "lucide-react";
import { CoursePurchaseCard } from "@/components/courses/course-purchase-card";
import { Disclaimer } from "@/components/layout/disclaimer";
import { DatabaseUnavailable } from "@/components/layout/database-unavailable";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { formatINR } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await prisma.course.findUnique({ where: { slug } }).catch(() => null);

  return {
    title: course?.title ?? "Course",
    description: course?.description ?? "Course details",
  };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [courseResult, user] = await Promise.all([
    (async () => {
      try {
        const course = await prisma.course.findFirst({
          where: { slug, isPublished: true },
          include: {
            lessons: {
              orderBy: { lessonOrder: "asc" },
            },
          },
        });
        return { course, dbUnavailable: false };
      } catch {
        return { course: null, dbUnavailable: true };
      }
    })(),
    getCurrentUser(),
  ]);

  const { course, dbUnavailable } = courseResult;

  if (dbUnavailable) {
    return (
      <div className="site-container py-10">
        <DatabaseUnavailable context="course details" />
      </div>
    );
  }

  if (!course) {
    notFound();
  }

  const purchase = user
    ? await prisma.purchase.findUnique({
        where: {
          userId_courseId: {
            userId: user.id,
            courseId: course.id,
          },
        },
      })
    : null;

  const purchased = Boolean(purchase);
  const previewLessons = course.lessons.filter((lesson) => lesson.isPreview);
  const lockedLessons = Math.max(0, course.lessons.length - previewLessons.length);
  const outcomes = course.lessons.slice(0, 4);

  return (
    <div className="page-shell">
      <div className="site-container space-y-8 py-12">
        <section className="hero-gradient hero-course-detail p-7 sm:p-8">
          <div className="relative z-10 space-y-4">
            <Link href="/courses" className="inline-flex items-center gap-2 text-sm text-[#d4e8f4] transition hover:text-white">
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Course Catalog
            </Link>

            <div className="space-y-3">
              <h1 className="max-w-4xl text-3xl font-bold leading-tight text-white sm:text-4xl">{course.title}</h1>
              <p className="max-w-3xl text-sm text-[#d4e8f4] sm:text-base">{course.description}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {purchased ? <Badge className="bg-[#e2f5f4] text-[#055b64]">Purchased</Badge> : <Badge variant="warning">Preview Access</Badge>}
              <Badge className="bg-white/12 text-white">{course.lessons.length} total lessons</Badge>
              <Badge className="bg-white/12 text-white">{previewLessons.length} free preview</Badge>
              <Badge className="bg-white/12 text-white">{formatINR(course.pricePaise)} one-time</Badge>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-6">
            <Card className="border-[#c6d8e9]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#006d77]" />
                  What You Will Learn
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {outcomes.length ? (
                  outcomes.map((lesson) => (
                    <div key={lesson.id} className="flex items-start gap-2 rounded-xl border border-[#d1e1ef] bg-[#f4f9ff] p-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#006d77]" />
                      <p className="text-sm text-[#36506d]">{lesson.title}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#4d6480]">Learning outcomes will appear once lessons are added.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Curriculum</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.lessons.map((lesson) => {
                  const canOpenLesson = purchased || lesson.isPreview;

                  return (
                    <div key={lesson.id} className="rounded-xl border border-[#d1e1ef] p-4 transition hover:border-[#8eb8d9] hover:bg-[#f3f9ff]">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#edf5ff] text-xs font-semibold text-[#3d5f80]">
                            {String(lesson.lessonOrder).padStart(2, "0")}
                          </span>

                          <div className="space-y-1">
                            {canOpenLesson ? (
                              <Link href={`/dashboard/learning/${course.id}/lesson/${lesson.id}`} className="font-semibold text-[#006d77] hover:text-[#0a4d5d]">
                                {lesson.title}
                              </Link>
                            ) : (
                              <p className="font-semibold text-[#153451]">{lesson.title}</p>
                            )}
                            <p className="text-sm text-[#4d6480]">{lesson.description || "Focused practical lesson for this module."}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {lesson.isPreview ? (
                            <Badge variant="neutral" className="inline-flex items-center gap-1">
                              <PlayCircle className="h-3.5 w-3.5" />
                              Preview
                            </Badge>
                          ) : null}
                          {!lesson.isPreview && !purchased ? (
                            <Badge variant="warning" className="inline-flex items-center gap-1">
                              <Lock className="h-3.5 w-3.5" />
                              Locked
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <CoursePurchaseCard courseId={course.id} title={course.title} pricePaise={course.pricePaise} purchased={purchased} />

            {purchased ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ready To Continue?</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/dashboard/learning/${course.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#006d77] hover:text-[#0a4d5d]">
                    Open full learning dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-[#d1e1ef] bg-[#f4f9ff]">
                <CardHeader>
                  <CardTitle className="text-base">Before You Enroll</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-[#36506d]">
                  <p>Preview lessons available: {previewLessons.length}</p>
                  <p>Locked premium lessons: {lockedLessons}</p>
                  {previewLessons.length ? (
                    <Link href={`/dashboard/learning/${course.id}`} className="inline-flex items-center gap-2 font-semibold text-[#006d77] hover:text-[#0a4d5d]">
                      Open preview lessons
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Disclaimer />
      </div>
    </div>
  );
}
