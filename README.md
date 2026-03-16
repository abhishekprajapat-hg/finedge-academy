# FinEdge Academy (MVP v2)

Production-oriented full-stack platform for financial education, LMS sales, and lead generation.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS + shadcn-style UI components
- PostgreSQL + Prisma ORM
- OTP user authentication + separate admin password login with JWT cookie sessions
- Razorpay checkout + webhook-based course access
- Bunny Stream video upload + tokenized embed playback support

## Core Modules Implemented

- Public site: Home, About, Courses, Blog (list/detail), Brokerage/MF hub, Insurance hub, Contact
- Separate user/admin auth flows with role-based routing
- Financial profiling engine with weighted risk classification (Conservative/Moderate/Aggressive)
- LMS: course catalog, lessons, premium access via webhook-confirmed purchases, progress tracking
- Brokerage affiliate bridge logging
- Insurance HLV calculator + hot-lead quote trigger
- Blog CMS (admin CRUD, draft/published, SEO fields, TipTap editor)
- Lead CRM inbox + status updates + CSV download
- Admin KPIs (users, leads, sales, revenue)

## Quick Start

1. Install dependencies

```bash
npm install
```

2. Configure environment

```bash
cp .env.example .env
```

Update `.env` values as needed (`DATABASE_URL`, `JWT_SECRET`, `ADMIN_LOGIN_EMAIL`, `ADMIN_LOGIN_PASSWORD`, Razorpay keys, Bunny Stream keys).

3. Generate Prisma client

```bash
npm run prisma:generate
```

4. Create/apply database schema

```bash
npm run prisma:migrate
```

5. Seed demo data

```bash
npm run prisma:seed
```

6. Run development server

```bash
npm run dev
```

7. Verify PostgreSQL connection

Open `http://localhost:3000/api/db-test` to confirm app-to-database connectivity.

## Useful Scripts

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:seed`

## Security Notes

- OTP request and lead-capture APIs are rate-limited.
- All major API inputs are validated with Zod.
- User course access is granted only after Razorpay webhook verification.
- Admin routes require admin session from admin-password login.

## Demo Credentials

Seed creates:

- Admin user record: `admin@example.com`
- User: `learner@example.com`

Login flows:

- User login: OTP-based (`/login`). In local/dev mode OTP is logged by the server.
- Admin login: email + password at `/admin` using `.env` values (`ADMIN_LOGIN_EMAIL`, `ADMIN_LOGIN_PASSWORD`).

## Bunny Stream (Optional)

To enable secure course video hosting with Bunny Stream, set these environment variables:

- `BUNNY_STREAM_LIBRARY_ID`
- `BUNNY_STREAM_API_KEY`
- `BUNNY_STREAM_EMBED_TOKEN_KEY` (recommended for tokenized playback)
- `BUNNY_STREAM_TOKEN_TTL_SECONDS` (default `3600`)

Admin course manager supports direct Bunny upload per lesson and auto-fills embeddable lesson URL.
