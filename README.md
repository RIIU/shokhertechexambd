# ShokherTech Exam BD

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
- Data is stored in `.data/db.json` (git-ignored). Back it up; delete it to start fresh. Use a real database before deploying to serverless hosting such as Vercel (see `docs/SPEC.md` §6.4).

Demo exams: `/exam/ssc-physics-live-01` (12 Qs, 15 min, −0.25 negative marking, one attempt) and `/exam/ssc-physics-practice-ch1`.

## Where things are

| Deliverable | File |
|---|---|
| Design tokens, glow/border animations, fonts | `tailwind.config.js`, `app/globals.css` |
| Anti-cheat wrapper | `components/security/AntiCheatWrapper.tsx` (+ `Watermark.tsx`) |
| SSC Science subject page | `app/ssc/science/page.tsx` → `components/subjects/*` |
| Live exam | `app/exam/[id]/page.tsx` (server) + `LiveExamClient.tsx` + `components/exam/*` |
| Grading API (answer key stays server-side) | `app/api/attempts/[attemptId]/submit/route.ts`, `lib/exams/grading.ts` |
| Result & analytics | `app/results/[attemptId]/page.tsx`, `components/result/*` |
| Login / register | `app/(auth)/*`, `lib/server/auth.ts`, `middleware.ts` |
| Student dashboard | `app/dashboard/page.tsx` |
| Admin panel | `app/admin/*` |
| Full spec: architecture, admin panel, data model, security model | [`docs/SPEC.md`](docs/SPEC.md) |

## Fonts

Bangla text uses **Baloo Da 2** and English text and numbers use **Inter**, both loaded from Google Fonts with `next/font` (no files to add). Baloo Da 2 is under the SIL Open Font License, so it is free for web use.
