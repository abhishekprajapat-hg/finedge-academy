import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatINR } from "@/lib/format";
import { getSessionUserFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getSessionUserFromCookies();
  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const [latestProfile, purchases] = await Promise.all([
    prisma.financialProfile.findFirst({
      where: { userId: user.id },
      select: {
        category: true,
        weightedScore: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.purchase.findMany({
      where: { userId: user.id, status: "PAID" },
      orderBy: { purchasedAt: "desc" },
      select: {
        id: true,
        amountPaise: true,
        purchasedAt: true,
        course: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="page-shell">
      <div className="site-container space-y-8 py-12">
        <section className="hero-gradient hero-dashboard p-7 sm:p-8">
          <div className="relative z-10 space-y-3">
            <p className="kicker">User Dashboard</p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">Welcome back, {user.fullName || user.email || user.phone}.</h1>
            <p className="max-w-3xl text-sm leading-7 text-[#d4e8f4] sm:text-base">
              Track profile insights, continue purchased courses, and keep your learning progress moving.
            </p>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Risk Category</CardTitle>
            </CardHeader>
            <CardContent>
              {latestProfile ? (
                <div className="space-y-2">
                  <Badge>{latestProfile.category}</Badge>
                  <p className="text-sm text-[#4d6480]">Score: {latestProfile.weightedScore}</p>
                </div>
              ) : (
                <p className="text-sm text-[#4d6480]">No profile yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Courses Purchased</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#0d1b2a]">{purchases.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Learning Spend</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[#0d1b2a]">{formatINR(purchases.reduce((total, purchase) => total + purchase.amountPaise, 0))}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Learning</CardTitle>
          </CardHeader>
          <CardContent>
            {purchases.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {purchases.map((purchase) => (
                  <div key={purchase.id} className="space-y-2 rounded-xl border border-[#d1e1ef] bg-[#f4f9ff] p-4">
                    <p className="font-bold text-[#153451]">{purchase.course.title}</p>
                    <p className="text-sm text-[#4d6480]">Purchased on {formatDate(purchase.purchasedAt)}</p>
                    <Button asChild size="sm">
                      <Link href={`/dashboard/learning/${purchase.course.id}`}>Resume Course</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#4d6480]">No purchased courses yet.</p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/contact">Book Consultation</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/profile">Update Financial Profile</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
