-- Run once in Supabase → SQL Editor → New query → Run, to switch on 3D models
alter table public.products add column if not exists model_url text;
