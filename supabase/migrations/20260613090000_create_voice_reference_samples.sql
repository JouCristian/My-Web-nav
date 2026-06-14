create extension if not exists pgcrypto;

create table if not exists public.voice_reference_samples (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  tags text[] not null default '{}',
  avatar_path text,
  avatar_url text,
  audio_path text not null,
  audio_url text not null,
  audio_duration_seconds numeric,
  audio_mime_type text,
  audio_size_bytes bigint,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_voice_reference_samples_active_sort
on public.voice_reference_samples (is_active, sort_order, created_at desc);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_voice_reference_samples_updated_at on public.voice_reference_samples;

create trigger set_voice_reference_samples_updated_at
before update on public.voice_reference_samples
for each row
execute function public.set_updated_at();

alter table public.voice_reference_samples enable row level security;

drop policy if exists "Public can read active voice samples" on public.voice_reference_samples;
create policy "Public can read active voice samples"
on public.voice_reference_samples
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Admin can read all voice samples" on public.voice_reference_samples;
create policy "Admin can read all voice samples"
on public.voice_reference_samples
for select
to authenticated
using ((auth.jwt() ->> 'email') = 'zoujunyi869@gmail.com');

drop policy if exists "Admin can insert voice samples" on public.voice_reference_samples;
create policy "Admin can insert voice samples"
on public.voice_reference_samples
for insert
to authenticated
with check ((auth.jwt() ->> 'email') = 'zoujunyi869@gmail.com');

drop policy if exists "Admin can update voice samples" on public.voice_reference_samples;
create policy "Admin can update voice samples"
on public.voice_reference_samples
for update
to authenticated
using ((auth.jwt() ->> 'email') = 'zoujunyi869@gmail.com')
with check ((auth.jwt() ->> 'email') = 'zoujunyi869@gmail.com');

drop policy if exists "Admin can delete voice samples" on public.voice_reference_samples;
create policy "Admin can delete voice samples"
on public.voice_reference_samples
for delete
to authenticated
using ((auth.jwt() ->> 'email') = 'zoujunyi869@gmail.com');

grant select on public.voice_reference_samples to anon, authenticated;
grant all on public.voice_reference_samples to service_role;

insert into storage.buckets (id, name, public)
values ('voice-reference-samples', 'voice-reference-samples', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can read voice reference sample files" on storage.objects;
create policy "Public can read voice reference sample files"
on storage.objects
for select
to public
using (bucket_id = 'voice-reference-samples');

