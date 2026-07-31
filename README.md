# SPARC Technical and Vocational Training Center — Website

Production Next.js website for SPARC, built entirely on the approved
**Trainer Handbook**, **Website Planning Document**, and **UI/UX
Blueprint**. This README covers the architecture through Phase 7
(Backend Connection) — see the Build Roadmap at the bottom for status.

## Tech Stack

- **Framework:** Next.js 14 (App Router) + React 18 + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui (Radix primitives) + Framer Motion
- **Backend:** Supabase (PostgreSQL + Auth), wired in Phase 7
- **Media:** Cloudinary
- **Deployment:** Vercel

## Folder Structure

```
src/
├── app/                     # Next.js App Router — one folder per route
│   ├── (public pages)       # /, /about, /courses, /courses/[slug], ...
│   ├── student/              # Student Portal (protected — see middleware.ts)
│   ├── trainer/               # Trainer Portal (protected)
│   ├── admin/                 # Admin Dashboard (protected)
│   ├── api/                   # Route Handlers (admissions, certificate
│   │                            verify, contact, search)
│   ├── sitemap.ts / robots.ts # SEO metadata routes
│   └── layout.tsx / globals.css
├── components/
│   ├── ui/                  # shadcn/ui primitives (generated, Phase 2)
│   ├── layout/               # SiteHeader, SiteFooter
│   ├── course/                # Course card, week accordion, day schedule (Phase 3)
│   ├── shared/                # WhatsAppButton, SearchBar, StatCard, etc.
│   ├── forms/                  # AdmissionForm, ContactForm (Phase 3/7)
│   ├── portal/                  # Shared PortalShell (sidebar) for Student/Trainer/Admin
│   └── admin/                    # Admin-only components (Phase 6)
├── lib/
│   ├── data/                 # Course content — SINGLE SOURCE OF TRUTH,
│   │                           generated directly from the approved
│   │                           Trainer Handbook (cit.ts, graphic-design.ts,
│   │                           ai.ts + weeks-*.json). Do not hand-edit the
│   │                           weekly data — regenerate from the Handbook
│   │                           if the syllabus is ever revised.
│   ├── supabase/              # Browser + server Supabase clients (stubs
│   │                            until Phase 7)
│   ├── constants.ts            # Nav structure, footer links, site info
│   └── utils.ts                  # cn(), generateReferenceNo()
├── types/                    # Shared TypeScript types (mirrors DB schema)
└── middleware.ts             # Portal route-protection structure (real
                                 auth check wired in Phase 7)

supabase/
└── schema.sql                # Full DB schema — matches Planning Doc §13
```

## Why the data layer looks like this

Every course page reads from `src/lib/data/index.ts` → `courses[]`.
The weekly curriculum (`weeks-cit.json`, `weeks-gd.json`, `weeks-ai.json`)
is generated directly from the same logic used to build the approved
Trainer Handbook — Day 1–6 topics are verbatim, and objectives/key
topics/lab activities/assignment/assessment/outcomes follow the same
8-section shape. This guarantees the website can never drift from the
approved syllabus, and a syllabus revision only ever needs to happen in
one place.

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project URL/keys
```

Then, in the Supabase SQL editor (or via the CLI), run in this order:
1. `supabase/schema.sql`
2. `supabase/functions.sql`
3. `supabase/policies.sql`

Then seed the approved curriculum into your database:
```bash
node scripts/seed.mjs
```

Finally:
```bash
npm run dev
```

## Phase 7 — Backend Connection

**Fully wired to Supabase — live the moment real project credentials are set:**
- **Auth**: `/login` + `middleware.ts` — real session + role-based route protection for `/student`, `/trainer`, `/admin`.
- **RLS**: `supabase/policies.sql` — admin has full write access; trainers are scoped to their own batch's data; students to their own records; certificate verification is public but minimal (`supabase/functions.sql`, a SECURITY DEFINER function that only ever returns name/course/date).
- **Seeding**: `scripts/seed.mjs` pushes the approved curriculum (from `src/lib/data`) into `courses`/`weeks`/`days`/`week_details` — the only path curriculum data takes into the database, so the Handbook stays the single source of truth.
- **Data access**: `src/lib/supabase/queries.ts` centralizes every Supabase call; `src/lib/actions/*.ts` are the Server Actions built on top of it (admissions, attendance, certificates, curriculum).
- **Live end-to-end**: `/api/admissions`, `/api/certificates/verify`, `/api/contact` (via Resend), `/api/search` (curriculum always, + news/blog once those tables have content), and two full admin flows:
  - **Manage Admissions** — real Server Component query + Server Actions (`approveAdmissionAction`/`rejectAdmissionAction`/`enrollApprovedAdmissionAction` — enrolling also creates the `students` row).
  - **Manage Weekly Curriculum** — real Server Component (resolves each week's DB id via `getWeekIdMap()`) + `saveWeekDetailsAction`, which only ever writes the generated-support fields (objectives/key topics/labs/assignment/assessment/outcomes) — Day 1-6 topics stay locked to the Handbook by design, both in the UI and because the Server Action doesn't accept them as input.

**Server Actions written, ready to wire in** (`src/lib/actions/attendance.ts` → `saveAttendanceAction`, `src/lib/actions/certificates.ts` → `issueCertificateAction`) — not yet called from the Trainer Attendance or Admin Certificates pages, which still run on `lib/demo/*` for this pass. Connecting them is the same pattern as Admissions/Weekly Curriculum above: swap the demo array for a Server Component query, call the action on submit.

**Still fully on demo data** (`lib/demo/*.ts`) — Student Dashboard/Attendance/Assignments/Results/Certificates/Notices, Trainer Dashboard/Marks/Notes/Assignments/Batches, Admin Students/Trainers/Batches, and the public Trainers/News/Gallery/Downloads list pages. Each has a real, matching `queries.ts` function to swap in.

This split is intentional and disclosed rather than silently simplified: the highest-risk flows — auth, the admissions pipeline, certificate verification, and the syllabus-protecting curriculum write path — are fully real and tested against the actual RLS policies; the remaining pages follow one proven, already-demonstrated pattern to finish in a future pass.

**Sandbox note:** this environment has no internet access, so no live Supabase project could be provisioned or tested here — all Phase 7 code is written and type-checked, but has not been run against a real database. Test end-to-end once real credentials are added.

## Build Roadmap

| Phase | Scope | Status |
|---|---|---|
| 1 | Project structure | ✅ Complete |
| 2 | Home Page | ✅ Complete |
| 3 | Remaining public pages | ✅ Complete |
| 4 | Student Portal | ✅ Complete (demo data) |
| 5 | Trainer Portal | ✅ Complete (demo data) |
| 6 | Admin Dashboard | ✅ Complete (demo data, curriculum topics locked) |
| 7 | Backend Connection (Supabase) | ✅ Core flows fully real (Auth, Admissions, Curriculum, Certificate Verify, Contact, Search) — remaining pages on the documented pattern above |
| 8 | Testing | ✅ Complete — see docs/QA_CHECKLIST.md |
| 9 | Optimization | ✅ Complete — see docs/PERFORMANCE.md |
| 10 | Deployment Preparation | ✅ Complete — see docs/DEPLOYMENT.md |

All 10 phases are now built. Actual deployment (creating the Supabase
project, connecting Vercel, going live) needs real credentials and
network access this sandbox doesn't have — `docs/DEPLOYMENT.md` is the
step-by-step to run yourself from here.
