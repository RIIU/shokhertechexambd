# ShokherTech Exam BD: Technical Specification

Anti-cheat online exam portal for Bangladesh's SSC & HSC students.
Next.js 14 (App Router) · TypeScript · Tailwind CSS 3 · GSAP · Framer Motion · Recharts · lucide-react.

Status legend used below: **Built** = implemented in this repo; **Planned** = specified here, not yet implemented.

---

## 1. Design system

### 1.1 Color tokens (`tailwind.config.js`)

| Token | Hex | Use |
|---|---|---|
| `brand-400` (`brand`) | `#00E699` | Primary actions, answered state, focus rings, glows |
| `brand-50…900` | scale | Tints for text-on-dark, fills |
| `glow-500` (`glow`) | `#6366F1` | Secondary accent (HSC, explanations, indigo glow) |
| `cyanlight-300` | `#67E8F9` | Highlights, current-question ring |
| `obsidian-900` | `#0B0F19` | App background (dark is the default and only theme) |
| `obsidian-800` | `#111827` | Raised surfaces, modals |
| `surface` | `#1F2937` | Cards |
| `ink` / `ink-muted` / `ink-subtle` | `#FFFFFF` / `#9CA3AF` / `#6B7280` | Headings / body / meta |
| `state-answered` / `flagged` / `unanswered` / `danger` | `#00E699` / `#F59E0B` / `#374151` / `#F43F5E` | Exam palette and timer states |

Accent classes per subject/stream are kept in a **static map** (`lib/accent.ts`) so Tailwind's JIT sees every class. Never build class names like `` `text-${accent}-400` ``.

### 1.2 Typography

| Family | Tailwind | Source |
|---|---|---|
| Inter | `font-sans` | `next/font/google` → `--font-inter` |
| Plus Jakarta Sans | `font-display` | `next/font/google` → `--font-jakarta` (numbers, headings in Latin) |
| **Ador Noirrit** | `font-bangla` | Self-hosted `@font-face` in `app/globals.css`, limited to the Bengali `unicode-range`. Files go in `public/fonts/ador-noirrit/` (see README there). |
| Hind Siliguri | fallback | `next/font/google` → `--font-bangla-fallback`; used while Ador Noirrit loads or if the files are absent |

Rule: every Bangla string is wrapped in an element with `lang="bn"`. `globals.css` maps `body [lang="bn"]` to `font-bangla`, which is accessible and keeps the font choice in one place. Latin characters inside Bangla text fall through to Inter, because Ador Noirrit is restricted to the Bengali range.

Bangla numerals: `toBn()` in `lib/utils.ts`; MCQ option labels are ক খ গ ঘ (`OPTION_LABEL_BN`).

### 1.3 Surfaces, glow & motion primitives

| Utility | What it does |
|---|---|
| `.glass` | Translucent gradient + 14px backdrop blur + hairline border |
| `.border-animated` + `animate-border-spin` | Conic-gradient border rotating via the registered `@property --border-angle`. Used for **active exam cards** (live subjects), the rules gate, the submit dialog and the result card |
| `shadow-glow*` | Emerald / indigo / danger outer glows |
| `animate-glow-pulse`, `animate-danger-pulse`, `animate-pulse-ring` | Pulse indicators (live badges, timer < 5 min) |
| `animate-gradient-x`, `animate-shimmer` | Progress bar |
| `.text-gradient` | White → mint → emerald → cyan headline gradient |
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
/exam/[id]                Rules gate → Live Exam (strict mode)                                  [Built]
/exam/[id]/result         Score, rank, accuracy donut, topic bars, explanations                [Built]
/admin/*                  Control center (see §6)                                               [Planned]
/login, /dashboard        Phone-OTP auth, student history                                       [Planned]
```

### Route → file map

```
app/
├─ layout.tsx                    fonts, Navbar/Footer (hidden on /exam/[id])
├─ page.tsx                      landing
├─ ssc/page.tsx, hsc/page.tsx    LevelOverview
├─ ssc/science/page.tsx          StreamSubjectsView(level="ssc", stream="science")
├─ ssc/[stream]/page.tsx         arts, commerce (SSG, dynamicParams=false)
├─ hsc/[stream]/page.tsx         science, arts, commerce (SSG)
├─ exam/[id]/page.tsx            server: load exam, strip answer key, resolve candidate + IP
├─ exam/[id]/LiveExamClient.tsx  client: exam state machine and layout
├─ exam/[id]/result/page.tsx     client: reads graded result from sessionStorage
└─ api/exams/[id]/
   ├─ submit/route.ts            POST: validate and grade server-side
   └─ violations/route.ts        POST: anti-cheat event sink (sendBeacon)
components/
├─ security/AntiCheatWrapper.tsx, Watermark.tsx
├─ exam/ExamTimer, ExamProgressBar, QuestionCard (+OptionSelector), QuestionPalette, SubmitDialog, ExamRulesGate
├─ subjects/StreamSubjectsView, SubjectGrid, SubjectCard, ExamTypeSheet, SubjectIcon
├─ landing/Hero, LevelSwitcher, StreamCards, LevelOverview, Features
├─ result/ResultCharts
├─ layout/Navbar, Footer
└─ ui/GsapReveal
lib/
├─ types.ts, utils.ts, accent.ts, routes.ts
├─ data/catalog.ts               levels, streams, subjects (NCTB codes), exam-type meta
├─ exams/bank.ts                 SERVER-ONLY seed questions with answer keys
├─ exams/repository.ts           getExam, toCandidateExam, parseSubmitPayload, gradeExam
└─ hooks/useExamSession.ts       persisted attempt state
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
│ Question text (Ador Noirrit, 18–20px)                         │  ① ② ③ ④ ⑤                    │
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
running ──manual confirm──► submitting ──► /exam/[id]/result
running ──timer hits 0──► submitting (reason "time-up", retried ×3)
running ──strike #maxWarnings──► submitting (reason "max-warnings", retried ×3)
```

`useExamSession` persists `{startedAt, endsAt, answers, flags, current, strikes}` to `sessionStorage`. A refresh resumes the **same deadline and strike count**. The timer derives remaining time from the absolute `endsAt`, so background-tab throttling or a reload can't buy time.

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
- **Planned:** authenticated attempts (`attemptId` issued at start, `startedAt` stored server-side, submissions rejected after `startedAt + duration + grace`); one submission per attempt; per-candidate shuffled question/option order (seeded by `attemptId`); rate limiting; persisting violation events and streaming them to the admin Live Monitor; device fingerprint + concurrent-session lock.

---

## 5. Results & analytics (Built)

- Score card with GSAP count-up, progress bar, auto-submit reason banner.
- Stats: rank / participants, accuracy (correct ÷ attempted), time taken, strikes.
- **Accuracy donut:** correct / wrong / skipped use status colors (emerald / rose / slate). Each slice also has an icon + text label and a 2px surface gap, because slate vs rose is only 6.7 ΔE for protan vision (checked with the palette validator).
- **Topic bars:** single-series horizontal bars (% correct per topic, 0–100, direct value labels).
- **Explanations:** filter (all / correct / wrong / skipped); correct option in emerald, a wrong pick in rose with icons, solution in an indigo callout.
- Negative marking: `score = Σ marks(correct) − negativeMark × wrong`, floored at 0.
- Rank is currently simulated (`estimateRank`). **Planned:** Redis sorted set per exam (`ZADD exam:{id} score attemptId`, `ZREVRANK`).

---

## 6. Admin panel: Control Center (Planned)

Route group `app/(admin)/admin/*`, protected by middleware (role = `admin | moderator`).

| Route | Purpose | Key UI |
|---|---|---|
| `/admin` | Overview | KPI tiles (active students, live attempts, today's submissions, alerts), live-exam ticker |
| `/admin/batches` | Batches / cohorts | Table + create drawer (name, level, stream, schedule, price) |
| `/admin/exams` | Exam list | Filters (level, stream, subject, type, status); duplicate / publish / archive |
| `/admin/exams/new` | Exam builder | Stepper: meta → pick questions from bank (filters + drag order) → rules (duration, negative mark, `maxWarnings`, shuffle, start window) → preview → publish |
| `/admin/questions` | Question bank | Virtualised table; MCQ editor (Bangla rich text, KaTeX for math, image upload, 4 options, answer, explanation, topic, chapter, difficulty); **bulk import** (CSV/XLSX template); **written (CQ) upload**: stem + ক/খ/গ/ঘ sub-questions with marks, PDF/image attachment |
| `/admin/monitor` | Live Exam Monitor | Per-exam grid of active candidates (progress, time left, strikes) over SSE/websocket; row turns rose on a strike; force-submit / extend time |
| `/admin/alerts` | Anti-cheat log | Stream of `ViolationEvent`s (kind, candidate, IP, time), filter by kind and exam, mark reviewed, invalidate attempt |
| `/admin/analytics` | User analytics | Cohort retention, score distributions per exam, question difficulty index & discrimination (flags bad questions) |

Shared admin components: `DataTable` (TanStack Table), `StatTile`, `FilterBar`, `Drawer`, `ConfirmDialog`, `QuestionEditor`.

### 6.1 Data model (Planned, PostgreSQL / Prisma)

```
User(id, phone UNIQUE, name, role, level, stream, createdAt)
Batch(id, name, level, stream, startsAt, endsAt)            BatchMember(batchId, userId)
Subject(id, level, stream, code, nameBn, nameEn, chapters)
Question(id, subjectId, chapter, topic, type[MCQ|CQ], stem, options JSON, answer, explanation, difficulty, createdBy)
Exam(id, subjectId, type[practice|model|live|archive], titleBn, durationSec, negativeMark, maxWarnings, shuffle, opensAt, closesAt, status)
ExamQuestion(examId, questionId, order, marks)
Attempt(id, examId, userId, startedAt, submittedAt, reason, score, strikes, ip, userAgent)   UNIQUE(examId,userId) for live
Answer(attemptId, questionId, optionId, answeredAt)
Violation(id, attemptId, kind, strike, detail, ip, at)
```

---

## 7. Accessibility & performance

- Every interactive element is a real `button`/`a` with visible `:focus-visible` rings; the radio group, timer (`role="timer"`), progress bar, dialogs (`aria-modal`) and palette (`aria-current="step"`) carry ARIA.
- Bangla content marked `lang="bn"` for screen readers and font selection.
- Reduced motion respected globally.
- Subject pages are statically generated (SSG). Exam pages are dynamic (personalised watermark, `no-store`). Recharts is imported only by the result page, so no other route ships it.

## 8. Running locally

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck && npm run lint && npm run build
```

Try it: `/ssc/science` → পদার্থবিজ্ঞান → লাইভ পরীক্ষা, or go straight to `/exam/ssc-physics-live-01`.
