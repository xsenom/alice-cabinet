# Настройка новой Supabase базы

## 1) Где прописать новую базу

В проекте подключение задаётся в клиенте Supabase через переменные окружения:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Файл клиента: `src/lib/supabase/client.ts`.

Создай/обнови `.env` (или `.env.local`) в корне проекта:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

После этого перезапусти dev-сервер.

## 2) SQL для новой базы

Выполняй команды **по одной**, отдельными блоками (так проще отлавливать ошибки):

```sql
-- profiles table
create table if not exists public.profiles_les (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  original_email text,
  full_name text,
  profession text,
  avatar_url text,
  status_admin boolean not null default false,
  plan_status text not null default 'free',
  plan_expires_at timestamptz,
  first_purchase_at timestamptz,
  purchases_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles_les add column if not exists original_email text;
alter table public.profiles_les add column if not exists status_admin boolean not null default false;
alter table public.profiles_les add column if not exists plan_status text not null default 'free';
alter table public.profiles_les add column if not exists plan_expires_at timestamptz;
alter table public.profiles_les add column if not exists first_purchase_at timestamptz;
alter table public.profiles_les add column if not exists purchases_count integer not null default 0;

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_les_updated_at on public.profiles_les;
create trigger trg_profiles_les_updated_at
before update on public.profiles_les
for each row execute function public.set_updated_at();

-- helper: admin flag check for RLS policies
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles_les
    where id = auth.uid()
      and status_admin = true
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- RLS
alter table public.profiles_les enable row level security;

drop policy if exists "profiles_les_select_own" on public.profiles_les;
create policy "profiles_les_select_own"
on public.profiles_les
for select
using (
  auth.uid() = id
  or public.is_admin()
);

drop policy if exists "profiles_les_insert_own" on public.profiles_les;
create policy "profiles_les_insert_own"
on public.profiles_les
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_les_update_own" on public.profiles_les;
create policy "profiles_les_update_own"
on public.profiles_les
for update
using (
  auth.uid() = id
  or public.is_admin()
)
with check (
  auth.uid() = id
  or public.is_admin()
);

-- storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
on storage.objects
for select
using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert"
on storage.objects
for insert
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update"
on storage.objects
for update
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);


-- assistant free usage per day
create table if not exists public.assistant_usage_les (
  user_id uuid not null references auth.users(id) on delete cascade,
  date_key date not null,
  questions_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, date_key)
);

alter table public.assistant_usage_les enable row level security;

drop policy if exists "assistant_usage_les_select_own" on public.assistant_usage_les;
create policy "assistant_usage_les_select_own"
on public.assistant_usage_les
for select
using (auth.uid() = user_id);

drop policy if exists "assistant_usage_les_upsert_own" on public.assistant_usage_les;
create policy "assistant_usage_les_upsert_own"
on public.assistant_usage_les
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

## 3) CLI-команды (опционально)

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Если не используешь `supabase db push`, достаточно выполнить SQL вручную в SQL Editor.
