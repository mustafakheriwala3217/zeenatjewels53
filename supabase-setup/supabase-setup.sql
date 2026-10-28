-- Zeenat Jewels: run this once in Supabase → SQL Editor → New query → Run.
-- Only the owner email below can add, edit or delete products and see visitor counts.
-- If you log in with a different email, replace zeenat.jewels53@gmail.com everywhere below.

-- 1. Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'gold',
  stone text,
  metal text,
  price numeric,
  description text,
  images text[] not null default '{}',
  model_url text,
  is_ring boolean not null default false,
  is_new boolean not null default true,
  visible boolean not null default true,
  sort_order integer not null default 100,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

drop policy if exists "Anyone can see visible products" on public.products;
create policy "Anyone can see visible products" on public.products
  for select using (visible or (auth.jwt() ->> 'email') = 'zeenat.jewels53@gmail.com');

drop policy if exists "Owner manages products" on public.products;
create policy "Owner manages products" on public.products
  for all to authenticated
  using ((auth.jwt() ->> 'email') = 'zeenat.jewels53@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'zeenat.jewels53@gmail.com');

-- 1b. Categories (photo + name for each "Shop by Category" tile)
create table if not exists public.categories (
  id text primary key,
  name text not null,
  image text,
  sort_order integer not null default 100,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

drop policy if exists "Anyone can see categories" on public.categories;
create policy "Anyone can see categories" on public.categories
  for select using (visible or (auth.jwt() ->> 'email') = 'zeenat.jewels53@gmail.com');

drop policy if exists "Owner manages categories" on public.categories;
create policy "Owner manages categories" on public.categories
  for all to authenticated
  using ((auth.jwt() ->> 'email') = 'zeenat.jewels53@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'zeenat.jewels53@gmail.com');

insert into public.categories (id, name, sort_order) values
  ('gold', 'Gold Rings', 10), ('silver', 'Silver Rings', 20), ('buttons', 'Kurta Buttons', 30),
  ('gems', 'Gem Stones', 40), ('bracelets', 'Takhti', 50), ('tasbih', 'Tasbih', 60)
on conflict (id) do nothing;

-- 2. Visitor counts (page views, product views, WhatsApp taps, payment taps)
create table if not exists public.events (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('view', 'product', 'whatsapp', 'pay')),
  product_id uuid references public.products(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists events_created_idx on public.events (created_at);

alter table public.events enable row level security;

drop policy if exists "Visitors can log events" on public.events;
create policy "Visitors can log events" on public.events
  for insert to anon, authenticated
  with check (kind in ('view', 'product', 'whatsapp', 'pay'));

drop policy if exists "Owner reads events" on public.events;
create policy "Owner reads events" on public.events
  for select to authenticated
  using ((auth.jwt() ->> 'email') = 'zeenat.jewels53@gmail.com');

-- 3. Photo storage (public so customers can see the photos)
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

drop policy if exists "Owner uploads photos" on storage.objects;
create policy "Owner uploads photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'products' and (auth.jwt() ->> 'email') = 'zeenat.jewels53@gmail.com');

drop policy if exists "Owner updates photos" on storage.objects;
create policy "Owner updates photos" on storage.objects
  for update to authenticated
  using (bucket_id = 'products' and (auth.jwt() ->> 'email') = 'zeenat.jewels53@gmail.com');

drop policy if exists "Owner deletes photos" on storage.objects;
create policy "Owner deletes photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'products' and (auth.jwt() ->> 'email') = 'zeenat.jewels53@gmail.com');

-- Rename an existing Bracelets category to Takhti (safe to run again)
update public.categories set name = 'Takhti' where id = 'bracelets' and name = 'Bracelets';

-- 3D models (safe to run again)
alter table public.products add column if not exists model_url text;

-- Saved description per category (safe to run again)
alter table public.categories add column if not exists description text;
