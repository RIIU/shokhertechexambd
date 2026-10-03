-- ShokherTech Exam BD: initial schema
-- Run in the Supabase SQL editor (or `supabase db push`).
--
-- Security model: the Next.js server talks to the database with the
-- service_role key (bypasses RLS). RLS is enabled on every table with NO
-- policies, so the public anon key can read nothing, not even exams
-- (which contain the answer keys).

create table if not exists public.users (
  id            text primary key,
  name          text not null,
  phone         text not null unique,
  password_hash text not null,
  role          text not null default 'student' check (role in ('student', 'admin')),
  level         text check (level in ('ssc', 'hsc')),
  stream        text check (stream in ('science', 'arts', 'commerce')),
  institution   text,
  blocked       boolean not null default false,
  created_at    timestamptz not null default now()
);

create table if not exists public.exams (
  id            text primary key,
  title_bn      text not null,
  title_en      text not null,
  level         text not null check (level in ('ssc', 'hsc')),
  stream        text not null check (stream in ('science', 'arts', 'commerce')),
  subject_id    text not null,
  type          text not null check (type in ('practice', 'model', 'live', 'archive')),
  duration_sec  integer not null check (duration_sec > 0),
  negative_mark numeric(4, 2) not null default 0 check (negative_mark >= 0),
  max_warnings  integer not null default 3 check (max_warnings between 1 and 10),
  status        text not null default 'draft' check (status in ('draft', 'published')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists exams_level_stream_idx on public.exams (level, stream, status);

create table if not exists public.questions (
  id                text not null,               -- unique within its exam (answers are keyed by it)
  exam_id           text not null references public.exams (id) on delete cascade,
  position          integer not null,
  text              text not null,
  options           jsonb not null,              -- [{ "id": "a", "text": "…" }, …]
  correct_option_id text not null check (correct_option_id in ('a', 'b', 'c', 'd')),
  explanation       text not null default '',
  topic             text not null default '',
  marks             numeric(5, 2) not null default 1 check (marks > 0),
  primary key (exam_id, id)
);
create index if not exists questions_exam_idx on public.questions (exam_id, position);

create table if not exists public.attempts (
  id           text primary key,
  exam_id      text not null references public.exams (id) on delete restrict,
  user_id      text not null references public.users (id) on delete cascade,
  started_at   timestamptz not null,
  ends_at      timestamptz not null,
  submitted_at timestamptz,
  reason       text check (reason in ('manual', 'time-up', 'max-warnings')),
  answers      jsonb,
  strikes      integer not null default 0,
  score        numeric(7, 2),                    -- copy of result.score, for ranking queries
  result       jsonb,
  ip           text,
  user_agent   text
);
-- At most one unsubmitted attempt per student per exam (makes "start" race-safe).
create unique index if not exists attempts_one_open_idx on public.attempts (exam_id, user_id) where submitted_at is null;
create index if not exists attempts_rank_idx on public.attempts (exam_id, score desc) where submitted_at is not null;
create index if not exists attempts_user_idx on public.attempts (user_id, started_at desc);

create table if not exists public.violations (
  id         text primary key,
  exam_id    text not null references public.exams (id) on delete cascade,
  attempt_id text references public.attempts (id) on delete cascade,
  user_id    text references public.users (id) on delete cascade,
  kind       text not null,
  strike     boolean not null default false,
  detail     text,
  ip         text,
  at         timestamptz not null default now()
);
create index if not exists violations_at_idx on public.violations (at desc);
create index if not exists violations_attempt_idx on public.violations (attempt_id);

-- A strike on a running attempt bumps its counter atomically.
create or replace function public.bump_attempt_strikes() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.strike and new.attempt_id is not null then
    update public.attempts set strikes = strikes + 1
    where id = new.attempt_id and submitted_at is null;
  end if;
  return new;
end $$;

drop trigger if exists violations_bump_strikes on public.violations;
create trigger violations_bump_strikes
  after insert on public.violations
  for each row execute function public.bump_attempt_strikes();

-- Lock everything down for the public API keys.
alter table public.users      enable row level security;
alter table public.exams      enable row level security;
alter table public.questions  enable row level security;
alter table public.attempts   enable row level security;
alter table public.violations enable row level security;

revoke all on public.users, public.exams, public.questions, public.attempts, public.violations from anon, authenticated;
revoke execute on function public.bump_attempt_strikes() from public, anon, authenticated;
