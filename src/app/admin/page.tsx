import Link from "next/link";
import { BlogStatus, LeadStatus, PaymentStatus } from "@prisma/client";
import { AdminLoginForm } from "@/components/forms/admin-login-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatINR } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const leadStatusOrder: LeadStatus[] = [
  LeadStatus.NEW,
  LeadStatus.CONTACTED,
  LeadStatus.QUALIFIED,
  LeadStatus.WON,
  LeadStatus.LOST,
];

const leadStatusLabel: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUALIFIED: "Qualified",
  WON: "Won",
  LOST: "Lost",
};

const leadStatusVariant: Record<LeadStatus, "default" | "neutral" | "warning" | "destructive"> = {
  NEW: "neutral",
  CONTACTED: "default",
  QUALIFIED: "warning",
  WON: "default",
  LOST: "destructive",
};

function toPercent(value: number, total: number) {
  if (!total) {
    return 0;
  }
  return (value / total) * 100;
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return (
      <div className="mx-auto w-full max-w-md py-14">
        <AdminLoginForm />
      </div>
    );
  }
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalUsers,
    newUsersThisWeek,
    totalLeads,
    openHotLeads,
    leadStatusBreakdown,
    topLeadSources,
    totalCourses,
    publishedCourses,
    totalLessons,
    totalPosts,
    publishedPosts,
    draftPosts,
    paidPurchases,
    failedPayments,
    revenueAgg,
    recentLeads,
    recentPurchases,
    recentPosts,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    }),
    prisma.lead.count(),
    prisma.lead.count({
      where: {
        isHot: true,
        status: { in: [LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.QUALIFIED] },
      },
    }),
    prisma.lead.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.lead.groupBy({
      by: ["source"],
      _count: { source: true },
      orderBy: {
        _count: {
          source: "desc",
        },
      },
      take: 5,
    }),
    prisma.course.count(),
    prisma.course.count({ where: { isPublished: true } }),
    prisma.lesson.count(),
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { status: BlogStatus.PUBLISHED } }),
    prisma.blogPost.count({ where: { status: BlogStatus.DRAFT } }),
    prisma.purchase.count({ where: { status: PaymentStatus.PAID } }),
    prisma.paymentOrder.count({ where: { status: PaymentStatus.FAILED } }),
    prisma.purchase.aggregate({
      where: { status: PaymentStatus.PAID },
      _sum: { amountPaise: true },
    }),
    prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        fullName: true,
        source: true,
        status: true,
        isHot: true,
        createdAt: true,
      },
    }),
    prisma.purchase.findMany({
      orderBy: { purchasedAt: "desc" },
      take: 6,
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            phone: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
    }),
    prisma.blogPost.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
      },
    }),
  ]);

  const revenuePaise = revenueAgg._sum.amountPaise ?? 0;
  const averageOrderValue = paidPurchases ? Math.round(revenuePaise / paidPurchases) : 0;

  const leadStatusCountMap = new Map<LeadStatus, number>(
    leadStatusBreakdown.map((entry) => [entry.status, entry._count.status]),
  );

  const pipeline = leadStatusOrder.map((status) => {
    const count = leadStatusCountMap.get(status) ?? 0;
    return {
      status,
      count,
      share: toPercent(count, totalLeads),
    };
  });

  const wonLeads = leadStatusCountMap.get(LeadStatus.WON) ?? 0;
  const activeLeads =
    (leadStatusCountMap.get(LeadStatus.NEW) ?? 0) +
    (leadStatusCountMap.get(LeadStatus.CONTACTED) ?? 0) +
    (leadStatusCountMap.get(LeadStatus.QUALIFIED) ?? 0);

  const leadWinRate = toPercent(wonLeads, totalLeads);
  const leadToSaleRate = toPercent(paidPurchases, totalLeads);
  const paymentFailureRate = toPercent(failedPayments, failedPayments + paidPurchases);
  const generatedAt = new Date();

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-950 via-emerald-900 to-sky-900 p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl space-y-3">
            <Badge className="hero-badge">Admin Control Center</Badge>
            <h1 className="text-3xl font-bold tracking-tight">Central dashboard for platform operations</h1>
            <p className="text-sm text-emerald-100/90 sm:text-base">
              Leads, content, learning sales, and user growth in one place. Use quick actions below to jump into any admin workflow.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm" variant="secondary">
              <Link href="/admin/leads">Open Lead Inbox</Link>
            </Button>
            <Button asChild size="sm" className="border border-white/20 bg-white/10 text-white hover:bg-white/20">
              <Link href="/admin/courses">Manage Courses</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={String(totalUsers)}
          helper={`${newUsersThisWeek} new in last 7 days`}
          tone="emerald"
        />
        <MetricCard
          title="Total Leads"
          value={String(totalLeads)}
          helper={`${activeLeads} active pipeline`}
          tone="sky"
        />
        <MetricCard
          title="Paid Purchases"
          value={String(paidPurchases)}
          helper={`AOV ${formatINR(averageOrderValue)}`}
          tone="amber"
        />
        <MetricCard
          title="Revenue"
          value={formatINR(revenuePaise)}
          helper={`${formatPercent(leadToSaleRate)} lead-to-sale rate`}
          tone="rose"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Lead Pipeline Health</CardTitle>
            <CardDescription>Status distribution and conversion visibility.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <InsightCard label="Win Rate" value={formatPercent(leadWinRate)} />
              <InsightCard label="Open Hot Leads" value={String(openHotLeads)} />
              <InsightCard label="Payment Failure" value={formatPercent(paymentFailureRate)} />
            </div>

            <div className="space-y-3">
              {pipeline.map((item) => (
                <div key={item.status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant={leadStatusVariant[item.status]}>{leadStatusLabel[item.status]}</Badge>
                      <span className="text-slate-700">{item.count} leads</span>
                    </div>
                    <span className="text-slate-500">{formatPercent(item.share)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(item.share, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/admin/leads">Open Pipeline</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <a href="/api/admin/leads/export">Export Lead CSV</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publishing & Catalog</CardTitle>
            <CardDescription>Track content and learning assets.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 rounded-lg border border-slate-200 p-4">
              <RowStat label="Courses" value={`${publishedCourses}/${totalCourses} published`} />
              <RowStat label="Lessons" value={String(totalLessons)} />
              <RowStat label="Blog" value={`${publishedPosts} live, ${draftPosts} draft`} />
              <RowStat label="Posts Total" value={String(totalPosts)} />
            </div>

            <div className="space-y-2">
              <QuickLink href="/admin/courses" title="Course Manager" description="Create, update, publish courses and lessons." />
              <QuickLink href="/admin/blog" title="Blog CMS" description="Manage drafts, SEO fields, and published posts." />
              <QuickLink href="/admin/users" title="User Profiles" description="Review users and recent risk profiles." />
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
            <CardDescription>Latest inbound leads across all sources.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLeads.length ? (
              recentLeads.map((lead) => (
                <div key={lead.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{lead.fullName}</p>
                      <p className="text-xs text-slate-500">{lead.source}</p>
                    </div>
                    <Badge variant={leadStatusVariant[lead.status]}>{leadStatusLabel[lead.status]}</Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                    {lead.isHot ? <Badge variant="warning">Hot</Badge> : null}
                    <span>{formatDate(lead.createdAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No leads yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Enrollments</CardTitle>
            <CardDescription>Latest paid learning purchases.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPurchases.length ? (
              recentPurchases.map((purchase) => (
                <div key={purchase.id} className="rounded-lg border border-slate-200 p-3">
                  <p className="font-medium text-slate-900">{purchase.course.title}</p>
                  <p className="text-xs text-slate-500">
                    {purchase.user.fullName || purchase.user.email || purchase.user.phone || "Unknown user"}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                    <span>{formatINR(purchase.amountPaise)}</span>
                    <span>{formatDate(purchase.purchasedAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No purchases yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traffic & Updates</CardTitle>
            <CardDescription>Lead channels and latest content edits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-800">Top Lead Sources</p>
              {topLeadSources.length ? (
                topLeadSources.map((source) => (
                  <div key={source.source} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
                    <span className="truncate pr-2 text-slate-700">{source.source}</span>
                    <span className="font-semibold text-slate-900">{source._count.source}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-600">No source data yet.</p>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-800">Latest Blog Updates</p>
              {recentPosts.length ? (
                recentPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm transition hover:border-emerald-300"
                  >
                    <span className="truncate pr-2 text-slate-700">{post.title}</span>
                    <Badge variant={post.status === BlogStatus.PUBLISHED ? "default" : "neutral"}>
                      {post.status === BlogStatus.PUBLISHED ? "Live" : "Draft"}
                    </Badge>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-600">No blog updates yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <p className="text-xs text-slate-500">Snapshot generated on {generatedAt.toLocaleString("en-IN")}</p>
    </div>
  );
}

function MetricCard({
  title,
  value,
  helper,
  tone,
}: {
  title: string;
  value: string;
  helper: string;
  tone: "emerald" | "sky" | "amber" | "rose";
}) {
  const toneStyles: Record<typeof tone, string> = {
    emerald: "from-emerald-100 to-white text-emerald-900",
    sky: "from-sky-100 to-white text-sky-900",
    amber: "from-amber-100 to-white text-amber-900",
    rose: "from-rose-100 to-white text-rose-900",
  };

  return (
    <Card className={`bg-gradient-to-br ${toneStyles[tone]}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-slate-600">{helper}</p>
      </CardContent>
    </Card>
  );
}

function InsightCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function QuickLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="block rounded-lg border border-slate-200 p-3 transition hover:border-emerald-300 hover:bg-emerald-50/50">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="text-sm text-slate-600">{description}</p>
    </Link>
  );
}

function RowStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}
