import { BlogStatus, PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

type LessonSeed = {
  title: string;
  description: string;
};

type CourseSeed = {
  slug: string;
  title: string;
  description: string;
  pricePaise: number;
  thumbnailUrl: string;
  lessons: LessonSeed[];
};

type BlogSeed = {
  slug: string;
  title: string;
  excerpt: string;
  metaDescription: string;
  bullets: [string, string, string];
};

const lessonVideoUrls = [
  "https://player.vimeo.com/video/76979871",
  "https://player.vimeo.com/video/22439234",
  "https://player.vimeo.com/video/146022717",
  "https://player.vimeo.com/video/357274789",
  "https://player.vimeo.com/video/1084537",
];

const courseSeeds: CourseSeed[] = [
  {
    slug: "mutual-fund-mastery",
    title: "Mutual Fund Mastery",
    description:
      "Build a practical mutual fund strategy with asset allocation, SIP planning, and periodic review frameworks.",
    pricePaise: 499900,
    thumbnailUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=80",
    lessons: [
      { title: "Mutual Fund Basics", description: "Understand fund categories and risk-return expectations." },
      { title: "SIP Planning", description: "Build goal buckets and create a disciplined SIP calendar." },
      { title: "Fund Selection", description: "Use expense, mandate, and consistency filters the right way." },
      { title: "Portfolio Review", description: "Quarterly review checklist for rebalancing decisions." },
    ],
  },
  {
    slug: "retirement-blueprint",
    title: "Retirement Blueprint",
    description:
      "Plan retirement corpus and income flows with inflation-adjusted assumptions and risk-matched allocations.",
    pricePaise: 799900,
    thumbnailUrl: "https://images.unsplash.com/photo-1638913662180-87ecfd28f4dd?auto=format&fit=crop&w=900&q=80",
    lessons: [
      { title: "Retirement Math", description: "Estimate retirement corpus with realistic inflation assumptions." },
      { title: "Accumulation Strategy", description: "Align assets with timeline and risk tolerance." },
      { title: "Decumulation Plan", description: "Build income buckets to reduce sequence risk." },
      { title: "Legacy Planning", description: "Nomination, wills, and family communication essentials." },
    ],
  },
  {
    slug: "stock-market-foundations",
    title: "Stock Market Foundations",
    description: "Learn market structure, valuation basics, and a repeatable framework for equity decision-making.",
    pricePaise: 599900,
    thumbnailUrl: "https://images.unsplash.com/photo-1559526324-593bc073d938?auto=format&fit=crop&w=900&q=80",
    lessons: [
      { title: "How Markets Work", description: "Primary vs secondary market and order flow basics." },
      { title: "Reading Financials", description: "Decode P&L, balance sheet, and cashflow quickly." },
      { title: "Valuation Basics", description: "PE, PB, ROE and margin of safety in simple terms." },
      { title: "Risk Controls", description: "Position sizing, stop logic, and behavior guardrails." },
    ],
  },
  {
    slug: "personal-finance-starter",
    title: "Personal Finance Starter",
    description: "Create your first end-to-end system for budgeting, emergency fund, debt cleanup, and investing.",
    pricePaise: 299900,
    thumbnailUrl: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=900&q=80",
    lessons: [
      { title: "Money Audit", description: "Track expenses and identify fixed and variable leaks." },
      { title: "Emergency Fund", description: "Set the right corpus and parking options." },
      { title: "Debt Prioritization", description: "Close high-interest debt using avalanche method." },
      { title: "First Investment Plan", description: "Build simple SIP plan based on goals." },
    ],
  },
  {
    slug: "tax-planning-pro-masterclass",
    title: "Tax Planning Pro Masterclass",
    description: "Move from last-minute tax saving to structured year-round tax optimization.",
    pricePaise: 449900,
    thumbnailUrl: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
    lessons: [
      { title: "Tax Basics", description: "Understand slabs, exemptions, and deductions clearly." },
      { title: "80C Smart Allocation", description: "Match products with goals instead of random buying." },
      { title: "Capital Gains Rules", description: "Equity, debt, and indexation implications." },
      { title: "Year-End Checklist", description: "Documentation and compliance timeline you can follow." },
    ],
  },
  {
    slug: "insurance-planning-simplified",
    title: "Insurance Planning Simplified",
    description: "Protect your family with practical term, health, and rider decisions without confusion.",
    pricePaise: 349900,
    thumbnailUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
    lessons: [
      { title: "Coverage Planning", description: "Estimate term and health coverage requirements." },
      { title: "Policy Comparison", description: "How to compare claim ratio, exclusions, and premium structure." },
      { title: "Rider Selection", description: "Choose riders that add value for your situation." },
      { title: "Claim Readiness", description: "Documents and communication plan for faster claims." },
    ],
  },
  {
    slug: "goal-based-investing-system",
    title: "Goal Based Investing System",
    description: "Translate life goals into timelines, monthly investments, and risk-aligned portfolios.",
    pricePaise: 549900,
    thumbnailUrl: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80",
    lessons: [
      { title: "Goal Mapping", description: "Convert goals into cost and time-based targets." },
      { title: "Return Assumptions", description: "Set practical assumptions for planning." },
      { title: "Portfolio Matching", description: "Map assets to each goal horizon." },
      { title: "Progress Monitoring", description: "Monthly and quarterly tracking cadence." },
    ],
  },
  {
    slug: "fixed-income-and-debt-funds",
    title: "Fixed Income and Debt Funds",
    description: "Understand debt products, duration risk, and how fixed income stabilizes portfolios.",
    pricePaise: 429900,
    thumbnailUrl: "https://images.unsplash.com/photo-1586486855514-8c633cc6fd38?auto=format&fit=crop&w=900&q=80",
    lessons: [
      { title: "Debt Instruments 101", description: "Bonds, gilt, and corporate debt explained." },
      { title: "Duration and Interest Rate Risk", description: "How rates impact debt fund NAV." },
      { title: "Credit Risk Basics", description: "Assess quality and diversification." },
      { title: "Allocation Strategy", description: "Use debt sleeve for stability and goals." },
    ],
  },
  {
    slug: "behavioural-finance-decisions",
    title: "Behavioural Finance Decisions",
    description: "Avoid common psychological biases that silently hurt long-term compounding.",
    pricePaise: 389900,
    thumbnailUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
    lessons: [
      { title: "Bias Identification", description: "Recognize overconfidence, anchoring, and recency bias." },
      { title: "Decision Rules", description: "Create personal rules to reduce emotional mistakes." },
      { title: "Market Volatility Behavior", description: "How to respond to drawdowns calmly." },
      { title: "Habit Tracking", description: "Build review rituals that improve decisions over time." },
    ],
  },
  {
    slug: "advanced-portfolio-rebalancing",
    title: "Advanced Portfolio Rebalancing",
    description: "Design a structured rebalancing process for tax efficiency and risk control.",
    pricePaise: 699900,
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
    lessons: [
      { title: "Rebalancing Triggers", description: "Time-based vs threshold-based rebalancing methods." },
      { title: "Tax-Aware Execution", description: "Manage taxes while adjusting allocations." },
      { title: "Cashflow Rebalancing", description: "Use new investments to reduce churn." },
      { title: "Performance Attribution", description: "Analyze what worked and refine process." },
    ],
  },
];

const blogImages = [
  "https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1579621970588-a35d0e7ab9b6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
];

const blogSeeds: BlogSeed[] = [
  {
    slug: "tax-saving-mistakes-investors-make",
    title: "Tax Saving Mistakes Investors Make",
    excerpt: "Common Section 80C errors and a practical checklist for cleaner tax-planning decisions.",
    metaDescription: "Avoid rushed tax moves with a practical framework for long-term portfolio health.",
    bullets: ["Map tax products to goals.", "Separate liquidity from lock-in plans.", "Review tax documents quarterly."],
  },
  {
    slug: "how-to-build-your-emergency-fund",
    title: "How to Build Your Emergency Fund",
    excerpt: "A simple coverage-based approach to decide your emergency corpus size.",
    metaDescription: "Plan your emergency fund with a practical expenses-first framework.",
    bullets: ["Calculate essential monthly burn.", "Set auto-transfer rules.", "Park money in liquid and safe options."],
  },
  {
    slug: "sip-vs-lump-sum-for-beginners",
    title: "SIP vs Lump Sum for Beginners",
    excerpt: "When to use SIP, when lump sum makes sense, and how to mix both smartly.",
    metaDescription: "Learn practical rules for SIP and lump sum decisions.",
    bullets: ["Use SIP for monthly discipline.", "Use staged deployment for large corpus.", "Review allocation annually."],
  },
  {
    slug: "first-salary-financial-plan",
    title: "First Salary Financial Plan",
    excerpt: "Set up your first budget, savings stack, and risk protection in one month.",
    metaDescription: "A practical first salary checklist for long-term money stability.",
    bullets: ["Build a basic budget split.", "Start emergency and insurance first.", "Begin goal-based SIP early."],
  },
  {
    slug: "term-insurance-cover-calculator-guide",
    title: "Term Insurance Cover Calculator Guide",
    excerpt: "A practical method to estimate term cover without buying random policy size.",
    metaDescription: "Calculate term insurance cover with a simple income-replacement framework.",
    bullets: ["Estimate family annual needs.", "Add liabilities and major goals.", "Subtract current assets and buffers."],
  },
  {
    slug: "health-insurance-mistakes-to-avoid",
    title: "Health Insurance Mistakes to Avoid",
    excerpt: "Understand waiting periods, exclusions, and coverage gaps before buying.",
    metaDescription: "Avoid common health insurance mistakes before claim time.",
    bullets: ["Read waiting period clauses.", "Check room rent and co-pay limits.", "Keep enough base + top-up cover."],
  },
  {
    slug: "retirement-planning-in-your-30s",
    title: "Retirement Planning in Your 30s",
    excerpt: "Small increases in savings during your 30s can reduce retirement stress massively.",
    metaDescription: "Build retirement confidence early with compounding and allocation discipline.",
    bullets: ["Start with realistic corpus targets.", "Increase SIP with each appraisal.", "Review inflation assumptions yearly."],
  },
  {
    slug: "mutual-fund-categories-explained",
    title: "Mutual Fund Categories Explained",
    excerpt: "Understand equity, debt, and hybrid categories without jargon overload.",
    metaDescription: "A simple guide to selecting mutual fund categories by goal horizon.",
    bullets: ["Map category to timeline.", "Prioritize consistency over recent returns.", "Avoid over-diversification clutter."],
  },
  {
    slug: "debt-funds-vs-fixed-deposits",
    title: "Debt Funds vs Fixed Deposits",
    excerpt: "Compare debt funds and FDs across liquidity, taxation, and risk.",
    metaDescription: "Know when debt funds or fixed deposits suit your objectives better.",
    bullets: ["Evaluate liquidity needs first.", "Compare post-tax outcomes.", "Use product mix for stability."],
  },
  {
    slug: "asset-allocation-simple-framework",
    title: "Asset Allocation Simple Framework",
    excerpt: "A beginner-friendly method to split money across equity, debt, and cash.",
    metaDescription: "Build a simple asset allocation model that stays practical in real life.",
    bullets: ["Define risk range clearly.", "Link allocation with goal horizon.", "Rebalance using thresholds."],
  },
  {
    slug: "goal-based-investing-roadmap",
    title: "Goal Based Investing Roadmap",
    excerpt: "Translate life goals into monthly investment actions with measurable milestones.",
    metaDescription: "Create a practical goal-based investing roadmap from scratch.",
    bullets: ["Convert goals into cost and date.", "Set monthly contribution targets.", "Track gap and adjust quarterly."],
  },
  {
    slug: "how-to-review-portfolio-quarterly",
    title: "How to Review Portfolio Quarterly",
    excerpt: "A 30-minute quarterly portfolio checklist for better long-term outcomes.",
    metaDescription: "Quarterly portfolio review checklist to stay aligned with your goals.",
    bullets: ["Check allocation drift.", "Review underperformers objectively.", "Update contributions if goals changed."],
  },
  {
    slug: "behavioral-biases-in-investing",
    title: "Behavioral Biases in Investing",
    excerpt: "Identify and reduce emotional decision traps that hurt compounding.",
    metaDescription: "Learn practical ways to avoid common behavioral investing mistakes.",
    bullets: ["Track recurring decision mistakes.", "Use pre-commitment rules.", "Separate process from outcomes."],
  },
  {
    slug: "how-to-build-credit-score",
    title: "How to Build Credit Score",
    excerpt: "Simple credit hygiene habits that improve your score steadily over time.",
    metaDescription: "Improve your credit score with practical repayment and utilization habits.",
    bullets: ["Pay dues before due date.", "Keep utilization below 30%.", "Avoid multiple credit enquiries quickly."],
  },
  {
    slug: "budgeting-rule-for-families",
    title: "Budgeting Rule for Families",
    excerpt: "Use a practical spending framework for household cashflow without over-complication.",
    metaDescription: "Family budgeting framework for needs, goals, and lifestyle spending balance.",
    bullets: ["Define fixed and flexible buckets.", "Automate savings first.", "Review leakages every month."],
  },
  {
    slug: "inflation-proofing-your-investments",
    title: "Inflation Proofing Your Investments",
    excerpt: "Protect purchasing power with a realistic long-term portfolio structure.",
    metaDescription: "Inflation-proof your investments using goal horizon and allocation matching.",
    bullets: ["Measure real returns, not nominal.", "Keep growth assets for long goals.", "Review inflation assumptions yearly."],
  },
  {
    slug: "emergency-fund-where-to-park",
    title: "Emergency Fund: Where to Park It",
    excerpt: "Learn where emergency money should be parked for liquidity and safety.",
    metaDescription: "Best places to park emergency funds without compromising accessibility.",
    bullets: ["Prioritize liquidity over returns.", "Split between savings and sweep options.", "Avoid lock-in products."],
  },
  {
    slug: "mistakes-first-time-stock-investors",
    title: "Mistakes First Time Stock Investors Make",
    excerpt: "Avoid common early-stage mistakes that derail confidence and capital.",
    metaDescription: "First-time stock investor mistakes and practical fixes.",
    bullets: ["Avoid tip-based buying.", "Use position sizing rules.", "Document entry and exit logic."],
  },
  {
    slug: "how-to-start-index-investing",
    title: "How to Start Index Investing",
    excerpt: "A no-noise guide to starting index investing with clarity and discipline.",
    metaDescription: "Start index investing with a simple, low-maintenance approach.",
    bullets: ["Pick broad-market exposure first.", "Automate SIP contributions.", "Stay consistent through volatility."],
  },
  {
    slug: "tax-efficient-withdrawal-strategies",
    title: "Tax Efficient Withdrawal Strategies",
    excerpt: "Build withdrawal plans that improve post-tax retirement cashflow.",
    metaDescription: "Tax-efficient withdrawal strategy basics for retirement planning.",
    bullets: ["Sequence withdrawals thoughtfully.", "Use tax brackets efficiently.", "Keep cash buffer for flexibility."],
  },
  {
    slug: "child-education-goal-planning",
    title: "Child Education Goal Planning",
    excerpt: "Estimate future education costs and structure a realistic funding plan.",
    metaDescription: "Plan child education goals with inflation-adjusted estimates and SIP discipline.",
    bullets: ["Project future cost with inflation.", "Create dedicated investment bucket.", "Increase SIP with income growth."],
  },
  {
    slug: "retirement-income-bucket-strategy",
    title: "Retirement Income Bucket Strategy",
    excerpt: "Create a multi-bucket retirement income system to reduce sequence risk.",
    metaDescription: "Use bucket strategy for stable retirement income planning.",
    bullets: ["Separate short, medium, long-term buckets.", "Align each bucket to risk profile.", "Refill buckets periodically."],
  },
  {
    slug: "avoid-common-loan-traps",
    title: "Avoid Common Loan Traps",
    excerpt: "Recognize hidden loan costs and avoid debt decisions that hurt cashflow.",
    metaDescription: "Common loan traps and practical checks before signing.",
    bullets: ["Compare APR, not just EMI.", "Avoid unnecessary add-on charges.", "Maintain repayment buffer."],
  },
  {
    slug: "insurance-riders-you-actually-need",
    title: "Insurance Riders You Actually Need",
    excerpt: "Select only meaningful riders instead of paying for every add-on.",
    metaDescription: "Choose useful insurance riders based on life stage and needs.",
    bullets: ["Evaluate rider relevance by goal.", "Avoid duplicate protection across policies.", "Prioritize claim practicality."],
  },
  {
    slug: "rebalancing-portfolio-with-confidence",
    title: "Rebalancing Portfolio With Confidence",
    excerpt: "Use a rule-based approach to rebalance calmly during market swings.",
    metaDescription: "Portfolio rebalancing framework for disciplined long-term investing.",
    bullets: ["Use threshold-based triggers.", "Factor taxation before churn.", "Document rebalance decisions."],
  },
];

function buildBlogContent(seed: BlogSeed) {
  return [
    `<p>${seed.excerpt}</p>`,
    "<p>Most investors know what to do but struggle with consistency. A simple framework and fixed review rhythm can solve this problem.</p>",
    "<h2>Key focus areas</h2>",
    `<ul><li>${seed.bullets[0]}</li><li>${seed.bullets[1]}</li><li>${seed.bullets[2]}</li></ul>`,
    "<h2>Action plan for this week</h2>",
    "<ol><li>Write down your current status and objective.</li><li>Set one measurable action for the next 30 days.</li><li>Review outcomes and refine your process.</li></ol>",
    "<p>Consistency beats complexity. Keep your process practical, documented, and review-driven.</p>",
  ].join("");
}

async function main() {
  const now = new Date();
  const adminEmail = "admin@example.com";
  const userEmail = "learner@example.com";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: Role.ADMIN,
      fullName: "Platform Admin",
      emailVerifiedAt: now,
    },
    create: {
      email: adminEmail,
      fullName: "Platform Admin",
      role: Role.ADMIN,
      emailVerifiedAt: now,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {
      fullName: "Demo Learner",
      role: Role.USER,
      emailVerifiedAt: now,
    },
    create: {
      email: userEmail,
      fullName: "Demo Learner",
      role: Role.USER,
      emailVerifiedAt: now,
    },
  });

  const seededCourses = await Promise.all(
    courseSeeds.map((courseSeed) =>
      prisma.course.upsert({
        where: { slug: courseSeed.slug },
        update: {
          title: courseSeed.title,
          description: courseSeed.description,
          pricePaise: courseSeed.pricePaise,
          thumbnailUrl: courseSeed.thumbnailUrl,
          isPublished: true,
        },
        create: {
          slug: courseSeed.slug,
          title: courseSeed.title,
          description: courseSeed.description,
          pricePaise: courseSeed.pricePaise,
          thumbnailUrl: courseSeed.thumbnailUrl,
          isPublished: true,
        },
      }),
    ),
  );

  for (const [courseIndex, course] of seededCourses.entries()) {
    const courseSeed = courseSeeds[courseIndex];
    await prisma.lesson.deleteMany({ where: { courseId: course.id } });

    await prisma.lesson.createMany({
      data: courseSeed.lessons.map((lesson, lessonIndex) => ({
        courseId: course.id,
        title: lesson.title,
        description: lesson.description,
        lessonOrder: lessonIndex + 1,
        videoUrl: lessonVideoUrls[(courseIndex + lessonIndex) % lessonVideoUrls.length],
        isPreview: lessonIndex === 0,
      })),
    });
  }

  for (const [index, blogSeed] of blogSeeds.entries()) {
    const publishedAt = new Date(Date.now() - index * 24 * 60 * 60 * 1000);
    const featuredImage = blogImages[index % blogImages.length];
    const content = buildBlogContent(blogSeed);

    await prisma.blogPost.upsert({
      where: { slug: blogSeed.slug },
      update: {
        title: blogSeed.title,
        excerpt: blogSeed.excerpt,
        content,
        featuredImage,
        metaTitle: `${blogSeed.title} | FinEdge Academy`,
        metaDescription: blogSeed.metaDescription,
        status: BlogStatus.PUBLISHED,
        publishedAt,
        authorId: admin.id,
      },
      create: {
        slug: blogSeed.slug,
        title: blogSeed.title,
        excerpt: blogSeed.excerpt,
        content,
        featuredImage,
        metaTitle: `${blogSeed.title} | FinEdge Academy`,
        metaDescription: blogSeed.metaDescription,
        status: BlogStatus.PUBLISHED,
        publishedAt,
        authorId: admin.id,
      },
    });
  }

  const existingLead = await prisma.lead.findFirst({
    where: {
      email: "prospect@example.com",
      source: "Term Insurance Calculator",
    },
  });

  if (!existingLead) {
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

  const totalCourses = await prisma.course.count();
  const totalBlogs = await prisma.blogPost.count();
  const totalPublishedBlogs = await prisma.blogPost.count({
    where: { status: BlogStatus.PUBLISHED },
  });

  console.log(`Seed complete. Courses: ${totalCourses}, Blogs: ${totalBlogs}, Published blogs: ${totalPublishedBlogs}`);
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
