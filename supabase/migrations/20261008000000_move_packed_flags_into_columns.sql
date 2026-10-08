-- Move data that the app used to smuggle into free-text columns into the real
-- columns added by 20261003000001–3. Idempotent: running it twice changes nothing.
--
-- The drivers already READ from both places, so this cleanup is optional — but
-- until it runs, a student-facing paywall flag lives inside an exam title and a
-- profile picture lives inside the school-name field.

-- 1) Exams ---------------------------------------------------------------
-- [hide_solutions] in title_en meant "don't show the answer key".
update public.exams
   set show_solutions = false
 where title_en like '%[hide_solutions]%';

-- Every exam is free now. The retired [paid] / [paid:60] title tag is the only
-- thing that could make an exam paid, so clear it instead of honouring it;
-- is_paid/price columns are the single source of truth from here on.
update public.exams
   set is_paid = false,
       price   = 0
 where title_en like '%paid%'
    or coalesce(is_paid, false)
    or coalesce(price, 0) > 0;

-- Drop the tags from the title itself.
update public.exams
   set title_en = btrim(replace(replace(regexp_replace(replace(title_en, '[hide_solutions]', ''), '\[paid:[0-9]+\]', '', 'g'), '[paid]', ''), '  ', ' '))
 where title_en like '%hide_solutions%'
    or title_en like '%[paid%';

-- 2) Users ---------------------------------------------------------------
-- institution used to hold either a plain school name or a JSON blob with the
-- school name, avatar, cover, bio and the enrolment/subscription meta. Lift the
-- image and bio fields into their columns and keep only the meta that has no
-- column of its own.
create or replace function pg_temp.st_json_or_null(txt text) returns jsonb
language plpgsql as $$
begin
  return txt::jsonb;
exception
  when others then return null;
end $$;

with packed as (
  select id, pg_temp.st_json_or_null(institution) as j
    from public.users
   where institution is not null
), meta as (
  select id,
         j,
         jsonb_typeof(j) = 'object' as is_object,
         coalesce(j->>'institution', j->>'inst', '') as inst
    from packed
), carried as (
  select id, j, inst,
         (   j ? 'enrolledExams'
            or j ? 'subscriptionStatus'
            or j ? 'subscriptionValidUntil'
            or j ? 'paymentRequests'
            or j ? 'latestPayment') as has_meta
    from meta
   where is_object
)
update public.users u
   set avatar_url  = coalesce(nullif(u.avatar_url, ''),  c.j->>'avatarUrl'),
       cover_url   = coalesce(nullif(u.cover_url, ''),   c.j->>'coverUrl'),
       bio         = coalesce(nullif(u.bio, ''),         c.j->>'bio'),
       institution = case
                       when c.has_meta then jsonb_strip_nulls(jsonb_build_object(
                         'inst',                  c.inst,
                         'enrolledExams',         c.j->'enrolledExams',
                         'subscriptionStatus',    c.j->'subscriptionStatus',
                         'subscriptionValidUntil', c.j->'subscriptionValidUntil',
                         'paymentRequests',       c.j->'paymentRequests',
                         'latestPayment',         c.j->'latestPayment'))::text
                       else nullif(c.inst, '')
                     end
  from carried c
 where c.id = u.id
   -- Only touch rows that were actually JSON-packed.
   and left(btrim(u.institution), 1) = '{';

drop function if exists pg_temp.st_json_or_null(text);
