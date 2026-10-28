-- Run once in Supabase → SQL Editor → New query → Run
-- Adds a saved description to each category (used by the owner page dropdown)
alter table public.categories add column if not exists description text;
