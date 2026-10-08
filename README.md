# Shokher Tech Academy

Anti-cheat online exam portal for Bangladesh's **SSC & HSC** students: chapter practice, model tests, live exams and instant analytics, in a deep-green, lime-accented UI whose colors are taken from pixxen.com.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS 3 · GSAP · Framer Motion · Recharts · lucide-react

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # production build
npm run typecheck && npm run lint
```

### Accounts

- **Students** sign up at `/register` with a mobile number and password, then land on `/dashboard`.
- **Admin**: in development an admin is created automatically: `01700000000` / `admin12345`. For a real deployment, copy `.env.example` to `.env.local` and set `SESSION_SECRET`, `ADMIN_PHONE` and `ADMIN_PASSWORD` **before the first start**.
- **Database: Supabase (Postgres).** Run `supabase/setup.sql` (all migrations in one file) in your project's SQL editor and set `SUPABASE_URL` + `SUPABASE_SECRET_KEY`. Step-by-step guide (Bangla): [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md).
- Without Supabase keys the app falls back to a local JSON file (`.data/db.json`, git-ignored): handy for development, not for Vercel.
- After changing anything in `supabase/migrations/`, mirror it into `supabase/setup.sql` — the two are kept in sync by hand.

Demo exams: `/exam/ssc-physics-live-01` (12 Qs, 15 min, −0.25 negative marking, one attempt) and `/exam/ssc-physics-practice-ch1`.

## Where things are

| Deliverable | File |
|---|---|
| Design tokens, glow/border animations, fonts | `tailwind.config.js`, `app/globals.css` |
| Brand logo, favicon, PWA icons | `public/shokher-tech-academy-logo.png`, `components/layout/BrandLogo.tsx`, `app/icon.png`, `app/apple-icon.png`, `public/icons/*`, `app/manifest.ts` |
| Landing page (hero, stats, live exams, leaderboard, FAQ) | `app/page.tsx`, `components/landing/*`, data from `lib/server/landing.ts` |
| Anti-cheat wrapper | `components/security/AntiCheatWrapper.tsx` (+ `Watermark.tsx`) |
| SSC Science subject page | `app/ssc/science/page.tsx` → `components/subjects/*` |
| Live exam | `app/exam/[id]/page.tsx` (server) + `LiveExamClient.tsx` + `components/exam/*` |
| Grading API (answer key stays server-side) | `app/api/attempts/[attemptId]/submit/route.ts`, `lib/exams/grading.ts` |
| Result & analytics | `app/results/[attemptId]/page.tsx`, `components/result/*` |
| Login / register | `app/(auth)/*`, `lib/server/auth.ts`, `middleware.ts` |
| Student dashboard | `app/dashboard/page.tsx` |
| Admin panel | `app/admin/*` |
| Persistence (one interface, two drivers) | `lib/server/store/{types,supabase,json}.ts`, chosen by `lib/server/store/index.ts` |
| Database schema & data fixes | `supabase/migrations/*.sql`, `supabase/setup.sql` |
| Full spec: architecture, admin panel, data model, security model | [`docs/SPEC.md`](docs/SPEC.md) |

## How the data layer works

`lib/server/store/types.ts` is the only persistence interface the app talks to. `supabase.ts` (Postgres, production) and `json.ts` (local file, development) both implement it, so business rules in `lib/server/{users,exams,attempts,stats,landing}.ts` never mention a driver.

Columns are the source of truth. Two things used to be smuggled into free-text fields and are now read from real columns — with the old encoding still accepted on read so no row is lost:

- `exams.show_solutions` (was a `[hide_solutions]` tag inside `title_en`)
- `users.avatar_url` / `cover_url` / `bio` (were JSON packed into `institution`)

`supabase/migrations/20261008000000_move_packed_flags_into_columns.sql` rewrites the old rows; running it is optional because reads already union both sources.

## Product decisions worth knowing

- **Every exam is free right now.** `is_paid`/`price` are the only paywall source and are `false`/`0`; the retired `[paid:60]` title tag is deliberately ignored. Enrollment and payment-request code stays in place for when paid exams return.
- **Public pages mask student names.** The landing leaderboard shows first name + initials and skips admin and blocked accounts — the students are SSC/HSC minors.
- **Admins can hide the answer key per exam** (`show_solutions`), in which case students see score and rank but not which questions they got wrong.
- **No invented social proof.** The landing testimonials section exists but renders nothing until real, consented quotes are added to `lib/data/testimonials.ts`.

## Fonts

Bangla text uses **Baloo Da 2** and English text and numbers use **Inter**, both loaded from Google Fonts with `next/font` (no files to add). Baloo Da 2 is under the SIL Open Font License, so it is free for web use.
