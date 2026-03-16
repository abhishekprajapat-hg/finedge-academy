import { BlogStatus, PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@example.com";
  const userEmail = "learner@example.com";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: Role.ADMIN, fullName: "Platform Admin" },
    create: {
      email: adminEmail,
      fullName: "Platform Admin",
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: { fullName: "Demo Learner" },
    create: {
      email: userEmail,
      fullName: "Demo Learner",
      role: Role.USER,
    },
  });

  const course1 = await prisma.course.upsert({
    where: { slug: "mutual-fund-mastery" },
    update: {
      title: "Mutual Fund Mastery",
      description:
        "Build a practical mutual-fund strategy with asset allocation, SIP planning, and periodic review frameworks.",
      pricePaise: 499900,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=80",
      isPublished: true,
    },
    create: {
      slug: "mutual-fund-mastery",
      title: "Mutual Fund Mastery",
      description:
        "Build a practical mutual-fund strategy with asset allocation, SIP planning, and periodic review frameworks.",
      pricePaise: 499900,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=80",
      isPublished: true,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { slug: "retirement-blueprint" },
    update: {
      title: "Retirement Blueprint",
      description:
        "Plan retirement corpus and income flows with inflation-adjusted assumptions and risk-matched allocations.",
      pricePaise: 799900,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1638913662180-87ecfd28f4dd?auto=format&fit=crop&w=900&q=80",
      isPublished: true,
    },
    create: {
      slug: "retirement-blueprint",
      title: "Retirement Blueprint",
      description:
        "Plan retirement corpus and income flows with inflation-adjusted assumptions and risk-matched allocations.",
      pricePaise: 799900,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1638913662180-87ecfd28f4dd?auto=format&fit=crop&w=900&q=80",
      isPublished: true,
    },
  });

  await prisma.lesson.deleteMany({ where: { courseId: { in: [course1.id, course2.id] } } });

  await prisma.lesson.createMany({
    data: [
      {
        courseId: course1.id,
        title: "Mutual Funds Basics",
        description: "Understand fund categories and risk-return expectations.",
        lessonOrder: 1,
        videoUrl: "https://player.vimeo.com/video/76979871",
        isPreview: true,
      },
      {
        courseId: course1.id,
        title: "Building SIP Buckets",
        description: "Allocate SIP across goals, tenure, and volatility.",
        lessonOrder: 2,
        videoUrl: "https://player.vimeo.com/video/22439234",
        isPreview: false,
      },
      {
        courseId: course2.id,
        title: "Retirement Math Foundations",
        description: "Estimate corpus needs with realistic inflation assumptions.",
        lessonOrder: 1,
        videoUrl: "https://player.vimeo.com/video/146022717",
        isPreview: true,
      },
      {
        courseId: course2.id,
        title: "Withdrawal Strategy",
        description: "Create decumulation plans and guardrails.",
        lessonOrder: 2,
        videoUrl: "https://player.vimeo.com/video/357274789",
        isPreview: false,
      },
    ],
  });

  await prisma.blogPost.upsert({
    where: { slug: "tax-saving-mistakes-investors-make" },
    update: {
      title: "Tax Saving Mistakes Investors Make",
      excerpt:
        "Common Section 80C errors and a practical checklist for cleaner tax-planning decisions.",
      content:
        "<p>Tax-saving decisions often get rushed in the final quarter. This leads to product-first, goal-last portfolios.</p><p><strong>Checklist:</strong></p><ul><li>Map each tax product to an actual goal horizon.</li><li>Separate liquidity needs from lock-in investments.</li><li>Review nominee and claim setup each year.</li></ul>",
      featuredImage:
        "https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&w=1200&q=80",
      metaTitle: "Tax Saving Mistakes: A Practical Investor Checklist",
      metaDescription:
        "Avoid rushed year-end tax moves with a practical framework for long-term portfolio health.",
      status: BlogStatus.PUBLISHED,
      publishedAt: new Date(),
      authorId: admin.id,
    },
    create: {
      slug: "tax-saving-mistakes-investors-make",
      title: "Tax Saving Mistakes Investors Make",
      excerpt:
        "Common Section 80C errors and a practical checklist for cleaner tax-planning decisions.",
      content:
        "<p>Tax-saving decisions often get rushed in the final quarter. This leads to product-first, goal-last portfolios.</p><p><strong>Checklist:</strong></p><ul><li>Map each tax product to an actual goal horizon.</li><li>Separate liquidity needs from lock-in investments.</li><li>Review nominee and claim setup each year.</li></ul>",
      featuredImage:
        "https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&w=1200&q=80",
      metaTitle: "Tax Saving Mistakes: A Practical Investor Checklist",
      metaDescription:
        "Avoid rushed year-end tax moves with a practical framework for long-term portfolio health.",
      status: BlogStatus.PUBLISHED,
      publishedAt: new Date(),
      authorId: admin.id,
    },
  });

  await prisma.blogPost.upsert({
    where: { slug: "how-to-build-your-emergency-fund" },
    update: {
      title: "How to Build Your Emergency Fund",
      excerpt:
        "A simple coverage-based approach to decide your emergency corpus size.",
      content:
        "<p>An emergency fund is a shock absorber. Start with 3-6 months of essential expenses and scale based on job stability.</p>",
      featuredImage:
        "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?auto=format&fit=crop&w=1200&q=80",
      metaTitle: "Emergency Fund Planning Guide",
      metaDescription:
        "Plan your emergency fund with a practical expenses-first framework.",
      status: BlogStatus.DRAFT,
      publishedAt: null,
      authorId: admin.id,
    },
    create: {
      slug: "how-to-build-your-emergency-fund",
      title: "How to Build Your Emergency Fund",
      excerpt:
        "A simple coverage-based approach to decide your emergency corpus size.",
      content:
        "<p>An emergency fund is a shock absorber. Start with 3-6 months of essential expenses and scale based on job stability.</p>",
      featuredImage:
        "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?auto=format&fit=crop&w=1200&q=80",
      metaTitle: "Emergency Fund Planning Guide",
      metaDescription:
        "Plan your emergency fund with a practical expenses-first framework.",
      status: BlogStatus.DRAFT,
      authorId: admin.id,
    },
  });

  await prisma.lead.create({
    data: {
      fullName: "Warm Prospect",
      email: "prospect@example.com",
      phone: "+911122334455",
      interestArea: "Term Insurance",
      source: "Term Insurance Calculator",
      isHot: true,
      message: "Need coverage guidance for family protection.",
      userId: user.id,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

