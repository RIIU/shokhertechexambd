# ShokherTech Exam BD: Technical Specification

Anti-cheat online exam portal for Bangladesh's SSC & HSC students.
Next.js 14 (App Router) · TypeScript · Tailwind CSS 3 · GSAP · Framer Motion · Recharts · lucide-react.

Status legend used below: **Built** = implemented in this repo; **Planned** = specified here, not yet implemented.

---

## 1. Design system

### 1.1 Color tokens (`tailwind.config.js`)

All values are sampled pixel-for-pixel from pixxen.com screenshots and cross-checked against its page source (`green1`–`green5`, `dark-shade*`).

| Token | Hex | Use |
|---|---|---|
| `obsidian-900` | `#002417` | App background and cards (pixxen page background) |
| `obsidian-800` | `#012819` | Header, raised surfaces, modals |
| `obsidian-950` | `#001B11` | Section gradient end (`bg-section`: `#002417` → `#001B11`), modal scrims |
| `bg-hero` | `#042E1B` → `#09351F` → `#063B25` | Landing hero band, plus a `#1A5C28`-style glow on the right |
| `surface` / `surface-border` / `surface-pill` | `#042E1B` / `#29473C` / `#1F382F` | Glass fills / card borders (pixxen `dark-shade3`) / pills |
| `brand-400` (`brand`) | `#99FE00` | Electric lime: primary buttons, answered state, focus rings, glows |
| `forest` | `#065136` | Text on lime buttons, dark-green fills |
| `leaf-400` / `leaf-600` | `#19CC61` / `#19914A` | Secondary green: labels, dots, icons, explanation callouts |
| `ink` / `ink-muted` / `ink-subtle` | `#FFFFFF` / `#A7BDB5` / `#759187` | Headings / body / meta (contrast on `#002417`: 16.6 / 8.4 / 4.9) |
| `state-answered` / `flagged` / `unanswered` / `danger` | `#99FE00` / `#F59E0B` / `#29473C` / `#F43F5E` | Exam palette and timer states |

Header, buttons and popups follow pixxen's components: a full-width `#012819` header with a `#065136` bottom border, a dark-green menu cell and a flush lime call-to-action; secondary buttons are white outlines that fill white on hover; popups and animated-border panels use pixxen's `radial-gradient(… #065136 → #002417)`.

Accent classes per subject/stream are kept in a **static map** (`lib/accent.ts`) so Tailwind's JIT sees every class. Never build class names like `` `text-${accent}-400` ``.

### 1.2 Typography

| Family | Tailwind | Source |
|---|---|---|
| Inter | `font-sans` | `next/font/google` → `--font-inter` |
| Plus Jakarta Sans | `font-display` | `next/font/google` → `--font-jakarta` (numbers, headings in Latin) |
| **Baloo Da 2** | `font-bangla` | `next/font/google` → `--font-bangla`, Bengali subset, variable weight 400–800, SIL Open Font License |

Rule: every Bangla string is wrapped in an element with `lang="bn"`. `globals.css` maps `body [lang="bn"]` to `font-bangla`, which is accessible and keeps the font choice in one place. The `font-bangla` stack lists Inter first. Inter has no Bengali glyphs, so English words and Latin digits inside Bangla text stay in Inter, while Bangla letters and ০–৯ render in Baloo Da 2.

Line heights are set per text size in `tailwind.config.js` (`fontSize`), tuned for Baloo Da 2: about 1.5–1.6 for body sizes, falling to 1.15–1.2 for the largest headings. The global Bangla rule only supplies a zero-specificity fallback (`:where(...)`), so `text-*` and `leading-*` utilities always win.

Bangla numerals: `toBn()` in `lib/utils.ts`; MCQ option labels are ক খ গ ঘ (`OPTION_LABEL_BN`).

### 1.3 Surfaces, glow & motion primitives

| Utility | What it does |
|---|---|
| `.glass` | Translucent gradient + 14px backdrop blur + hairline border |
| `.border-animated` + `animate-border-spin` | Conic-gradient border rotating via the registered `@property --border-angle`. Used for **active exam cards** (live subjects), the rules gate, the submit dialog and the result card |
| `shadow-glow*` | Lime / leaf-green / danger outer glows |
| `animate-glow-pulse`, `animate-danger-pulse`, `animate-pulse-ring` | Pulse indicators (live badges, timer < 5 min) |
| `animate-gradient-x`, `animate-shimmer` | Progress bar |
| `.text-gradient` | White → pale lime → lime → leaf-green headline gradient |
| `.no-select` | `user-select: none` + `-webkit-touch-callout: none` |

Motion split: **GSAP** for timelines, staggers, pointer physics (hero headline, parallax, grid load, card tilt, score count-up). **Framer Motion** for state-driven UI (tabs with `layoutId`, modals, sheets, option selection, question transitions). Both honour `prefers-reduced-motion` (GSAP via `gsap.matchMedia()`, CSS via a global media query).

Icons: lucide-react with `strokeWidth={1.5}`.

---

## 2. Information architecture & user flow

```
/                         Landing: hero, SSC|HSC level switcher → stream cards, features      [Built]
/ssc, /hsc                Level overview → pick stream                                         [Built]
/ssc/science              Subject grid (explicit route file)                                   [Built]
/{ssc|hsc}/{stream}       Subject grid for the other five level × stream combos                [Built]
   └─ subject card click → Exam-type sheet: Practice · Model Test · Live · Archive            [Built]
/login, /register          Mobile number + password accounts                                    [Built]
/dashboard                Student home: stats, score trend, subject skill, results             [Built]
/exam/[id]                Rules gate → Live Exam (strict mode), login required                  [Built]
/results/[attemptId]      Score, live rank, accuracy donut, topic bars, explanations           [Built]
/admin/*                  Control center (see §6), admin role only                              [Built]
```

### Route → file map

```
middleware.ts                    redirects signed-out users (and non-admins on /admin)
app/
├─ layout.tsx                    fonts, Navbar/Footer (hidden on /exam/[id])
├─ page.tsx                      landing
├─ (auth)/login, (auth)/register login & sign-up pages; (auth)/actions.ts = server actions
├─ dashboard/page.tsx            student dashboard
├─ ssc/…, hsc/…                  level + stream subject grids (exams read from the database)
├─ exam/[id]/page.tsx            server: auth, strip answer key, resume open attempt
├─ exam/[id]/LiveExamClient.tsx  client: exam state machine and layout
├─ results/[attemptId]/page.tsx  graded result (owner or admin)
├─ admin/                        layout (admin guard) + overview, exams, exams/new, exams/[id],
│                                students, attempts, alerts; admin/actions.ts = server actions
└─ api/
   ├─ auth/me                    GET: who is signed in (navbar)
   ├─ exams/[id]/start           POST: create/resume attempt, server deadline
   ├─ exams/[id]/violations      POST: anti-cheat event sink (sendBeacon)
   └─ attempts/[attemptId]/submit POST: grade once, server-side
components/  security/, exam/, subjects/, landing/, result/ (ResultView, ResultCharts),
             dashboard/, admin/, auth/, layout/, ui/ (StatTile, Panel, GsapReveal)
supabase/migrations/            SQL schema (tables, indexes, strike trigger, RLS lock-down)
lib/
├─ types.ts, utils.ts, accent.ts, routes.ts, phone.ts, session-token.ts (edge-safe JWT)
├─ data/catalog.ts               levels, streams, subjects (NCTB codes), exam-type meta
├─ exams/bank.ts                 seed questions (copied into the database on first run)
├─ exams/grading.ts              toCandidateExam, parseSubmitPayload, gradeExam
├─ hooks/useExamSession.ts       answer sheet per attempt (sessionStorage)
└─ server/                       SERVER-ONLY: store/ (supabase + json drivers), seed,
                                 password (scrypt), auth (cookie session), users, exams,
                                 attempts, stats
```

---

## 3. Live exam interface

### 3.1 Layout

```
┌──────────────────────── progress bar (fixed, 4px, gradient + shimmer) ────────────────────────┐
│ [ST] ● LIVE  পদার্থবিজ্ঞান লাইভ পরীক্ষা            [shield ▬▬▬ strikes]  [◔ ১৪:৫৭ timer]       │  sticky glass header
├───────────────────────────────────────────────────────────────┬───────────────────────────────┤
│ প্রশ্ন ৪/১২ · topic · মান ১                      [⚑ পরে দেখব]│  প্রশ্ন তালিকা         ৩/১২    │
│                                                               │  [উত্তর ৩][চিহ্নিত ১][বাকি ৮] │
│ Question text (Baloo Da 2, 18–20px)                           │  ① ② ③ ④ ⑤                    │
│ ┌ক option────────┐ ┌খ option────────┐                         │  ⑥ ⑦ ⑧ ⑨ ⑩   (sticky)         │
│ └────────────────┘ └────────────────┘                         │  ⑪ ⑫                           │
│ ┌গ option────────┐ ┌ঘ option────────┐                         │  [ পরীক্ষা জমা দাও ]           │
│ [‹ আগের প্রশ্ন]      1–4 · F · ↑↓ · ←→           [পরের প্রশ্ন ›]│                               │
└───────────────────────────────────────────────────────────────┴───────────────────────────────┘
Mobile (<lg): palette moves into a draggable bottom sheet; a fixed bottom bar holds ‹ / “৩/১২ উত্তর” / ›.
```

### 3.2 State machine (`LiveExamClient`)

```
hydrating ──► gate (ExamRulesGate) ──click (requests fullscreen)──► running
gate ──click──► POST /api/exams/[id]/start (server sets startedAt/endsAt) ──► running
running ──manual confirm──► submitting ──► /results/[attemptId]
running ──timer hits 0──► submitting (reason "time-up", retried ×3)
running ──strike #maxWarnings──► submitting (reason "max-warnings", retried ×3)
```

The deadline lives on the server attempt. The exam page hands an open attempt back after a refresh, the countdown is corrected for a wrong device clock, and `useExamSession` keeps only the answer sheet (`answers, flags, current, strikes`) in `sessionStorage`, keyed by attempt id. Live exams allow one submission per student.

### 3.3 Components

| Component | Notes |
|---|---|
| `ExamTimer` | SVG ring countdown; amber < 10 min; < 5 min turns rose with `animate-danger-pulse` + pulse ring + `aria-live="assertive"`; fires `onExpire` once |
| `QuestionCard` | Framer `AnimatePresence` slide/blur between questions; flag toggle; clear answer |
| `OptionSelector` | `role="radiogroup"` with roving tabindex, ↑/↓ moves between options; spring-animated check + shared `layoutId` ring |
| `QuestionPalette` | Status counts + numbered grid (answered / flagged / unanswered / current ring with `layoutId`) |
| `ExamProgressBar` | Fixed top hairline, spring width |
| `SubmitDialog` | Counts + unanswered warning, conic animated border |
| Keyboard | `1–4` select, `F` flag, `←/→` navigate |

---

## 4. Anti-cheat & security

### 4.1 Client layer: `AntiCheatWrapper` (Built)

| Threat | Countermeasure | Counts as strike? |
|---|---|---|
| Copying question text | `user-select:none`, `selectstart`/`dragstart` blocked, `copy`/`cut`/`paste` prevented | No (toast + logged) |
| Context menu / long-press | `contextmenu` prevented, `-webkit-touch-callout:none` | No (toast + logged) |
| Shortcuts | Blocks Ctrl/Cmd + C V X A U S P F; F12; Ctrl+Shift+I/J/C/K; Cmd+Opt+I/J/C/U; PrintScreen (clipboard wiped best-effort) | No (toast + logged) |
| Printing | `@media print { body { display:none } }` injected while active | n/a |
| Tab / app switch | `visibilitychange → hidden` | **Yes** |
| Window focus loss (second monitor, other window) | `window.blur` (deduped with visibility within 1.5 s) | **Yes** |
| Leaving fullscreen | `fullscreenchange` after fullscreen was actually entered (not counted for reloads; skipped on devices without the Fullscreen API) | **Yes** |
| DevTools open | Viewport-gap heuristic | No (false positives from zoom/side panels) |
| Removing / hiding the watermark in DevTools | `MutationObserver` integrity check → overlay remounted | **Yes** |
| Accidental navigation | `beforeunload` prompt | n/a |

At `maxWarnings` (default 3) strikes, the wrapper fires `onMaxWarnings` once and the exam is submitted with reason `max-warnings`. Every event is sent to `/api/exams/[id]/violations` with `navigator.sendBeacon` (falling back to `fetch` with `keepalive`), so it arrives even while the tab is being hidden.

**Watermark:** a canvas-rendered tile (`name · phone`, `IP · roll`, timestamp refreshed every minute) is repeated over a fixed, click-through layer above the exam (`z-70`). The layer drifts slowly so cropping can't remove it cleanly. The IP is resolved server-side from `x-forwarded-for`.

### 4.2 Server layer (Built / Planned)

Client-side controls only raise the cost of cheating; anyone who controls the browser can bypass them. The real guarantees are server-side:

- **Built:** the answer key never leaves the server before submission (`toCandidateExam` strips `correctOptionId` and `explanation`). Grading runs in `POST /api/exams/[id]/submit`, which re-validates every field (`parseSubmitPayload`). Exam routes send `X-Frame-Options: DENY` and `Cache-Control: no-store`.
- **Built:** login required for every exam; attempts created server-side with the server's `startedAt`/`endsAt`; time taken computed by the server; answers arriving more than 2 minutes after the deadline are discarded; each attempt is graded once; strikes = max(server log, client count); violation events stored with user, attempt and IP and shown in the admin log; login rate limit (8 failures / 10 min per number + IP).
- **Planned:** per-candidate shuffled question/option order (seeded by attempt id); device fingerprint + concurrent-session lock; websocket push for the live monitor (it polls every 10 s today).

---

## 5. Results & analytics (Built)

- Score card with GSAP count-up, progress bar, auto-submit reason banner.
- Stats: rank / participants, accuracy (correct ÷ attempted), time taken, strikes.
- **Accuracy donut:** correct / wrong / skipped use status colors (lime / rose / slate). Each slice also has an icon + text label and a 2px surface gap, because slate vs rose is only 6.7 ΔE for protan vision (checked with the palette validator).
- **Topic bars:** single-series horizontal bars (% correct per topic, 0–100, direct value labels).
- **Explanations:** filter (all / correct / wrong / skipped); correct option in lime, a wrong pick in rose with icons, solution in a leaf-green callout.
- Negative marking: `score = Σ marks(correct) − negativeMark × wrong`, floored at 0.
- Rank is real: 1 + number of submitted attempts on the same exam with a higher score, computed when the result is viewed (so it updates as others submit). At scale, move to a Redis sorted set per exam.

---

## 6. Accounts, dashboard & admin (Built)

### 6.1 Accounts

- Sign-up: name, mobile number (normalised to `01XXXXXXXXX`), SSC/HSC, stream, optional institution, password (6+ chars).
- Passwords hashed with scrypt (Node `crypto`, random salt, constant-time compare).
- Session: HS256 JWT (`jose`) in an `httpOnly`, `SameSite=Lax` cookie for 7 days, signed with `SESSION_SECRET`. The middleware checks the signature; pages and APIs re-read the user from the database, so blocking a student or changing a role takes effect at once.
- Roles: `student`, `admin`. The first admin is created from `ADMIN_PHONE` / `ADMIN_PASSWORD` (dev fallback `01700000000` / `admin12345`, never in production).

### 6.2 Student dashboard (`/dashboard`)

Exams taken, average score %, average accuracy, best rank · score trend line (last 12) · per-subject average · recent results with live rank · in-progress attempts with "continue" · suggested published exams for the student's level and stream.

### 6.3 Admin control center (`/admin`)

| Route | What it does |
|---|---|
| `/admin` | KPIs (students, published/draft exams, submissions and strikes in 24 h), **live monitor** of students currently sitting an exam (time left, strikes; refreshes every 10 s), recent strikes, 14-day submissions chart |
| `/admin/exams` | All exams with status filter, question count, submissions |
| `/admin/exams/new` | Create exam: Bangla/English title, level, stream, subject, type, minutes, negative mark, max warnings |
| `/admin/exams/[id]` | Question bank for the exam: add MCQ (4 options, correct answer, topic, marks, explanation), delete, edit details, publish/unpublish (needs ≥ 1 question), preview, delete exam (blocked once anyone has sat it) |
| `/admin/students` | Search by name/number/institution; exams taken, average, strikes; block/unblock |
| `/admin/attempts` | Every submission: score, live rank, time, strikes, submit reason; filter by exam or student; open the full result |
| `/admin/alerts` | Anti-cheat log: strikes only or all events, with student, exam, detail and IP |

**Next steps:** bulk question import (CSV/XLSX), images/math (KaTeX) in questions, written (CQ) answers, batches & scheduled live windows, moderator role.

### 6.4 Storage: Supabase

Data lives in **Supabase Postgres** (`supabase/migrations/20261003000000_init.sql`):

| Table | Holds | Notes |
|---|---|---|
| `users` | students & admins | `phone` unique; scrypt `password_hash` |
| `exams` | exam settings, `status` draft/published | |
| `questions` | MCQs, options as `jsonb`, answer key | PK `(exam_id, id)`, ordered by `position` |
| `attempts` | start/end/submit times, answers, graded `result` (`jsonb`), `score`, `strikes` | partial unique index = one open attempt per student per exam; rank index on `(exam_id, score)` |
| `violations` | anti-cheat events | trigger bumps `attempts.strikes` on a strike |

- **Access model:** only the Next.js server talks to the database, with the secret key, `sb_secret_…` or legacy `service_role` (`lib/server/store/supabase.ts`). RLS is enabled on every table with **no policies** and `anon`/`authenticated` privileges revoked, so the public anon key can read nothing, including the answer keys.
- **Auth** stays custom (mobile + password, JWT cookie) because Supabase phone auth needs a paid SMS provider. Users are rows in `public.users`, not `auth.users`.
- **Driver interface** `lib/server/store/types.ts`; `store()` picks Supabase when `SUPABASE_URL` + `SUPABASE_SECRET_KEY` are set, otherwise the JSON file (`json.ts`, development only). Business rules live above it in `lib/server/{users,exams,attempts,stats}.ts`.
- Reads page through PostgREST's 1000-row cap; Supabase calls opt out of Next.js fetch caching.
- First start seeds the demo exams and the first admin (`lib/server/seed.ts`).

---

## 7. Accessibility & performance

- Every interactive element is a real `button`/`a` with visible `:focus-visible` rings; the radio group, timer (`role="timer"`), progress bar, dialogs (`aria-modal`) and palette (`aria-current="step"`) carry ARIA.
- Bangla content marked `lang="bn"` for screen readers and font selection.
- Reduced motion respected globally.
- Landing and level pages are static; subject, exam, dashboard and admin pages render per request (fresh exams, personalised watermark, `no-store` on exam routes). Recharts is imported only by the result page, so no other route ships it.

## 8. Running locally

```bash
npm install
cp .env.example .env.local   # optional in dev
npm run dev                  # http://localhost:3000
npm run typecheck && npm run lint && npm run build
```

Dev admin: `01700000000` / `admin12345` (unless `ADMIN_PHONE`/`ADMIN_PASSWORD` are set). Register a student at `/register`, then try `/exam/ssc-physics-live-01`.
