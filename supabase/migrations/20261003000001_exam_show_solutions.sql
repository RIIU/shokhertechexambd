-- Add show_solutions column to exams table
-- Allows admins to control whether answer key & explanations are shown to students after submitting.
alter table public.exams add column if not exists show_solutions boolean not null default true;
