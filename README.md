# ShokherTech Exam BD

Anti-cheat online exam portal for Bangladesh's **SSC & HSC** students: chapter practice, model tests, live exams and instant analytics, in a dark, glassy, emerald-accented UI.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS 3 · GSAP · Framer Motion · Recharts · lucide-react

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # production build
npm run typecheck && npm run lint
```

Demo exams: `/exam/ssc-physics-live-01` (12 Qs, 15 min, −0.25 negative marking) and `/exam/ssc-physics-practice-ch1`.

## Where things are

| Deliverable | File |
|---|---|
| Design tokens, glow/border animations, fonts | `tailwind.config.js`, `app/globals.css` |
| Anti-cheat wrapper | `components/security/AntiCheatWrapper.tsx` (+ `Watermark.tsx`) |
| SSC Science subject page | `app/ssc/science/page.tsx` → `components/subjects/*` |
| Live exam | `app/exam/[id]/page.tsx` (server) + `LiveExamClient.tsx` + `components/exam/*` |
| Grading API (answer key stays server-side) | `app/api/exams/[id]/submit/route.ts`, `lib/exams/*` |
| Result & analytics | `app/exam/[id]/result/page.tsx`, `components/result/ResultCharts.tsx` |
| Full spec: architecture, admin panel, data model, security model | [`docs/SPEC.md`](docs/SPEC.md) |

## Bangla font

All Bangla text uses **Ador Noirrit**, which is self-hosted. The font files aren't committed. Put `AdorNoirrit-Regular.woff2` and `AdorNoirrit-Bold.woff2` in `public/fonts/ador-noirrit/` (see the README there). Until then, the UI falls back to Hind Siliguri.
