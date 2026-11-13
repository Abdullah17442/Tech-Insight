create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  slug text,
  content text not null default '',
  image_url text,
  category text not null default 'Technology',
  company text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

alter table public.blogs
  add column if not exists subtitle text,
  add column if not exists slug text,
  add column if not exists image_url text,
  add column if not exists company text,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists published_at timestamptz;

update public.blogs
set slug = coalesce(
  nullif(trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')), ''),
  'article'
) || '-' || id::text
where slug is null or btrim(slug) = '';

update public.blogs
set published_at = coalesce(published_at, created_at, now())
where status = 'published'
  and published_at is null;

with duplicate_slugs as (
  select id, slug,
    row_number() over (partition by slug order by id::text) as duplicate_number
  from public.blogs
  where slug is not null
)
update public.blogs as article
set slug = duplicate_slugs.slug || '-' || article.id::text
from duplicate_slugs
where article.id = duplicate_slugs.id
  and duplicate_slugs.duplicate_number > 1;

create unique index if not exists blogs_slug_unique
  on public.blogs (slug)
  where slug is not null;

create index if not exists blogs_published_created_at_idx
  on public.blogs (published_at desc)
  where status = 'published';

create or replace function public.set_tech_inside_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blogs_set_updated_at on public.blogs;
create trigger blogs_set_updated_at
before update on public.blogs
for each row execute function public.set_tech_inside_updated_at();

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.admins enable row level security;

do $$
declare
  policy_row record;
begin
  for policy_row in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'admins'
  loop
    execute format('drop policy if exists %I on public.admins', policy_row.policyname);
  end loop;
end;
$$;

create policy admins_read_self
  on public.admins for select
  to authenticated
  using (user_id = auth.uid());

grant select on public.admins to authenticated;
grant all on public.admins to service_role;

create or replace function public.is_tech_inside_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if to_regclass('public.admins') is null then
    return false;
  end if;

  return exists (
    select 1
    from public.admins
    where user_id = auth.uid()
  );
end;
$$;

revoke all on function public.is_tech_inside_admin()
  from public, anon;
grant execute on function public.is_tech_inside_admin()
  to authenticated, service_role;

alter table public.blogs enable row level security;

do $$
declare
  policy_row record;
begin
  for policy_row in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'blogs'
  loop
    execute format('drop policy if exists %I on public.blogs', policy_row.policyname);
  end loop;
end;
$$;

create policy blogs_public_published_read
  on public.blogs for select
  to anon, authenticated
  using (status = 'published');

create policy blogs_admin_manage
  on public.blogs for all
  to authenticated
  using (public.is_tech_inside_admin())
  with check (public.is_tech_inside_admin());

grant select on public.blogs to anon, authenticated;
grant insert, update, delete on public.blogs to authenticated;

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  is_active boolean not null default false,
  subscribed_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  confirmation_token_hash text
);

alter table public.subscribers
  add column if not exists is_active boolean not null default false,
  add column if not exists subscribed_at timestamptz not null default now(),
  add column if not exists confirmed_at timestamptz,
  add column if not exists unsubscribed_at timestamptz,
  add column if not exists confirmation_token_hash text;

revoke all on public.subscribers from anon, authenticated;
grant all on public.subscribers to service_role;

update public.subscribers
set email = lower(btrim(email))
where email <> lower(btrim(email));

create unique index if not exists subscribers_email_lower_unique
  on public.subscribers (lower(email));

create unique index if not exists subscribers_confirmation_token_unique
  on public.subscribers (confirmation_token_hash)
  where confirmation_token_hash is not null;

create table if not exists public.newsletter_signup_rate_limits (
  bucket_key text primary key,
  window_started_at timestamptz not null default now(),
  attempt_count integer not null default 0
);

create index if not exists newsletter_signup_rate_limits_window_idx
  on public.newsletter_signup_rate_limits (window_started_at);

alter table public.newsletter_signup_rate_limits enable row level security;
revoke all on public.newsletter_signup_rate_limits from anon, authenticated;
grant all on public.newsletter_signup_rate_limits to service_role;

create or replace function public.claim_newsletter_signup(
  p_email_hash text,
  p_ip_hash text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  rate_limit record;
  current_attempts integer;
begin
  if random() < 0.01 then
    delete from public.newsletter_signup_rate_limits
    where window_started_at < now() - interval '1 day';
  end if;

  for rate_limit in
    select 'email:' || p_email_hash as bucket_key, 3 as max_attempts
    union all
    select 'ip:' || p_ip_hash, 10
    where p_ip_hash is not null
  loop
    insert into public.newsletter_signup_rate_limits (
      bucket_key,
      window_started_at,
      attempt_count
    )
    values (rate_limit.bucket_key, now(), 1)
    on conflict (bucket_key) do update
      set window_started_at = case
            when public.newsletter_signup_rate_limits.window_started_at < now() - interval '1 hour'
              then now()
            else public.newsletter_signup_rate_limits.window_started_at
          end,
          attempt_count = case
            when public.newsletter_signup_rate_limits.window_started_at < now() - interval '1 hour'
              then 1
            else public.newsletter_signup_rate_limits.attempt_count + 1
          end
    returning attempt_count into current_attempts;

    if current_attempts > rate_limit.max_attempts then
      return false;
    end if;
  end loop;

  return true;
end;
$$;

revoke all on function public.claim_newsletter_signup(text, text)
  from public, anon, authenticated;
grant execute on function public.claim_newsletter_signup(text, text)
  to service_role;

alter table public.subscribers enable row level security;

do $$
declare
  policy_row record;
begin
  for policy_row in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'subscribers'
  loop
    execute format('drop policy if exists %I on public.subscribers', policy_row.policyname);
  end loop;
end;
$$;

create table if not exists public.newsletter_email_logs (
  id uuid primary key default gen_random_uuid(),
  article_id text not null,
  subscriber_id text not null,
  status text not null check (status in ('pending', 'sent', 'failed')),
  provider_message_id text,
  error_message text,
  attempt_count integer not null default 1 check (attempt_count > 0),
  attempted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  unique (article_id, subscriber_id)
);

alter table public.newsletter_email_logs
  add column if not exists attempted_at timestamptz not null default now();

revoke all on public.newsletter_email_logs from anon, authenticated;
grant all on public.newsletter_email_logs to service_role;

create or replace function public.claim_newsletter_email(
  p_article_id text,
  p_subscriber_id text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  claimed_id uuid;
begin
  insert into public.newsletter_email_logs (
    article_id,
    subscriber_id,
    status,
    attempt_count
  )
  values (p_article_id, p_subscriber_id, 'pending', 1)
  on conflict (article_id, subscriber_id) do update
    set status = 'pending',
        attempt_count = public.newsletter_email_logs.attempt_count + 1,
        attempted_at = now(),
        error_message = null
    where public.newsletter_email_logs.attempt_count < 5
      and (
        public.newsletter_email_logs.status = 'failed'
        or (
          public.newsletter_email_logs.status = 'pending'
          and public.newsletter_email_logs.attempted_at < now() - interval '15 minutes'
        )
      )
  returning id into claimed_id;

  return claimed_id is not null;
end;
$$;

revoke all on function public.claim_newsletter_email(text, text)
  from public, anon, authenticated;
grant execute on function public.claim_newsletter_email(text, text)
  to service_role;

alter table public.newsletter_email_logs enable row level security;

do $$
declare
  policy_row record;
begin
  for policy_row in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'newsletter_email_logs'
  loop
    execute format(
      'drop policy if exists %I on public.newsletter_email_logs',
      policy_row.policyname
    );
  end loop;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'article-images',
  'article-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
declare
  policy_row record;
begin
  for policy_row in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and (
        coalesce(qual, '') like '%article-images%'
        or coalesce(with_check, '') like '%article-images%'
      )
  loop
    execute format('drop policy if exists %I on storage.objects', policy_row.policyname);
  end loop;
end;
$$;

create policy article_images_public_read
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'article-images');

create policy article_images_admin_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'article-images'
    and public.is_tech_inside_admin()
  );

create policy article_images_admin_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'article-images'
    and public.is_tech_inside_admin()
  )
  with check (
    bucket_id = 'article-images'
    and public.is_tech_inside_admin()
  );

create policy article_images_admin_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'article-images'
    and public.is_tech_inside_admin()
  );
