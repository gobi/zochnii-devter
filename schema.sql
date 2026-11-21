-- Зочны дэвтэр — Supabase дээрх сэтгэгдлийн хүснэгт.
-- Supabase-ийн самбар → SQL Editor-т бүтнээр нь буулгаж, нэг удаа ажиллуулна.

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 50),
  text text not null check (char_length(btrim(text)) between 1 and 500),
  created_at timestamptz not null default now()
);

-- RLS асаана: доорх дүрэмд зөвшөөрөөгүй бүх үйлдэл хориотой.
alter table public.comments enable row level security;

-- Нэвтрээгүй зочин (anon) бүх сэтгэгдлийг уншиж болно.
create policy "Zochin unshina" on public.comments
  for select to anon using (true);

-- Нэвтрээгүй зочин шинэ сэтгэгдэл нэмж болно.
create policy "Zochin nemne" on public.comments
  for insert to anon with check (true);

-- Засах, устгах дүрэм байхгүй — зочин хэний ч сэтгэгдлийг өөрчилж, устгаж чадахгүй.
-- Зохисгүй сэтгэгдлийг эзэн Supabase-ийн самбар (Table Editor)-оос устгана.

-- Зочин зөвхөн нэр, сэтгэгдэл хоёрыг л бичнэ; огноо, дугаарыг сан өөрөө онооно.
revoke all on public.comments from anon, authenticated;
grant select on public.comments to anon;
grant insert (name, text) on public.comments to anon;
