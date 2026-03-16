import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { LessonCompleteButton } from "@/components/dashboard/lesson-complete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toPlayableVideoUrl } from "@/lib/video";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(`/dashboard/learning/${courseId}/lesson/${lessonId}`)}`);
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      course: {
        include: {
          lessons: {
            orderBy: { lessonOrder: "asc" },
          },
        },
      },
    },
  });

  if (!lesson || lesson.courseId !== courseId) {
    redirect(`/dashboard/learning/${courseId}`);
  }

  const purchase = await prisma.purchase.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId,
      },
    },
  });

  const purchased = Boolean(purchase);
  if (!purchased && !lesson.isPreview) {
    redirect(`/courses/${lesson.course.slug}`);
  }

  const accessibleLessons = purchased
    ? lesson.course.lessons
    : lesson.course.lessons.filter((item) => item.isPreview);

  const currentIndex = accessibleLessons.findIndex((item) => item.id === lesson.id);
  if (currentIndex === -1) {
    redirect(`/dashboard/learning/${courseId}`);
  }

  const previousLesson = currentIndex > 0 ? accessibleLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < accessibleLessons.length - 1 ? accessibleLessons[currentIndex + 1] : null;

  const progressRows = await prisma.lessonProgress.findMany({
    where: {
      userId: user.id,
      lessonId: {
        in: accessibleLessons.map((item) => item.id),
      },
    },
  });

  const progressMap = new Map(progressRows.map((item) => [item.lessonId, Boolean(item.completedAt)]));
  const completedCount = accessibleLessons.filter((item) => progressMap.get(item.id)).length;
  const progressPercent = accessibleLessons.length ? Math.round((completedCount / accessibleLessons.length) * 100) : 0;
  const lessonCompleted = progressMap.get(lesson.id) ?? false;
  const playableVideoUrl = toPlayableVideoUrl(lesson.videoUrl);
  const useIframePlayer = isEmbedVideoUrl(playableVideoUrl);
  const iframeVideoUrl = useIframePlayer ? withIframePlayerDefaults(playableVideoUrl) : playableVideoUrl;

  return (
    <div className="page-shell">
      <div className="site-container space-y-6 py-12">
        <section className="hero-gradient hero-lesson rounded-2xl p-5 text-white sm:p-6">
          <div className="space-y-3">
          <Link
            href={`/dashboard/learning/${courseId}`}
            className="inline-flex items-center gap-2 text-sm text-[#d4e8f4] transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Curriculum
          </Link>

          <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
          <p className="max-w-3xl text-sm text-[#d4e8f4] sm:text-base">{lesson.description || "Continue this lesson and mark progress."}</p>

          <div className="flex flex-wrap items-center gap-2">
            {lesson.isPreview ? <Badge variant="neutral">Preview Lesson</Badge> : <Badge>Premium Lesson</Badge>}
            {lessonCompleted ? <Badge>Completed</Badge> : <Badge variant="warning">In Progress</Badge>}
            <Badge className="bg-white/10 text-white">{progressPercent}% course progress</Badge>
          </div>
        </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Lesson Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-black">
                <div className="aspect-video w-full">
                  {useIframePlayer ? (
                    <iframe
                      src={iframeVideoUrl}
                      title={lesson.title}
                      className="h-full w-full"
                      allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                      allowFullScreen
                    />
                  ) : (
                    <video src={playableVideoUrl} controls playsInline preload="metadata" className="h-full w-full bg-black" />
                  )}
                </div>
              </div>
              {useIframePlayer ? (
                <p className="text-xs text-slate-500">
                  Player not visible?{" "}
                  <a href={iframeVideoUrl} target="_blank" rel="noreferrer" className="font-semibold text-emerald-700 hover:text-emerald-800">
                    Open in new tab
                  </a>
                </p>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#d1e1ef] bg-[#f4f9ff] p-3">
                <p className="text-sm text-[#4d6480]">
                  {completedCount}/{accessibleLessons.length} lessons completed in this path.
                </p>
                <LessonCompleteButton lessonId={lesson.id} completed={lessonCompleted} />
              </div>

              <div className="flex flex-wrap gap-2">
                {previousLesson ? (
                  <Button asChild variant="outline">
                    <Link href={`/dashboard/learning/${courseId}/lesson/${previousLesson.id}`} className="flex items-center gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Previous Lesson
                    </Link>
                  </Button>
                ) : null}

                {nextLesson ? (
                  <Button asChild>
                    <Link href={`/dashboard/learning/${courseId}/lesson/${nextLesson.id}`} className="flex items-center gap-2">
                      Next Lesson
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link href={`/dashboard/learning/${courseId}`}>Back to Curriculum</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit xl:sticky xl:top-24">
          <CardHeader>
            <CardTitle className="text-base">Course Navigator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {accessibleLessons.map((item, index) => {
              const active = item.id === lesson.id;
              const completed = progressMap.get(item.id) ?? false;

              return (
                <Link
                  key={item.id}
                  href={`/dashboard/learning/${courseId}/lesson/${item.id}`}
                  className={`block rounded-lg border p-3 transition ${
                    active
                      ? "border-[#9ac6e5] bg-[#edf6ff]"
                      : "border-[#d1e1ef] hover:border-[#9ac6e5] hover:bg-[#edf6ff]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-[#5f7893]">Lesson {String(index + 1).padStart(2, "0")}</p>
                      <p className="truncate text-sm font-semibold text-[#153451]">{item.title}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {item.isPreview ? (
                        <Badge variant="neutral" className="inline-flex items-center gap-1">
                          <PlayCircle className="h-3.5 w-3.5" />
                          Preview
                        </Badge>
                      ) : !purchased ? (
                        <Badge variant="warning" className="inline-flex items-center gap-1">
                          <Lock className="h-3.5 w-3.5" />
                          Locked
                        </Badge>
                      ) : null}
                      {completed ? (
                        <Badge className="inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Done
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}

function isEmbedVideoUrl(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host === "iframe.mediadelivery.net" || host === "player.mediadelivery.net") {
      return true;
    }
    if (host === "player.vimeo.com" || host === "www.youtube.com" || host === "youtube.com" || host === "m.youtube.com") {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function withIframePlayerDefaults(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host === "iframe.mediadelivery.net" || host === "player.mediadelivery.net") {
      parsed.searchParams.set("autoplay", "false");
      parsed.searchParams.set("loop", "false");
      parsed.searchParams.set("muted", "false");
      parsed.searchParams.set("preload", "true");
      parsed.searchParams.set("responsive", "true");
      return parsed.toString();
    }
    return url;
  } catch {
    return url;
  }
}
