create table if not exists public.upcoming_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null,
  event_date date not null,
  company_name text not null,
  description text not null,
  status text not null default 'draft'
    check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists upcoming_events_published_date_idx
  on public.upcoming_events (event_date asc)
  where status = 'published';

drop trigger if exists upcoming_events_set_updated_at on public.upcoming_events;
create trigger upcoming_events_set_updated_at
before update on public.upcoming_events
for each row execute function public.set_tech_inside_updated_at();

alter table public.upcoming_events enable row level security;

drop policy if exists upcoming_events_public_read on public.upcoming_events;
create policy upcoming_events_public_read
  on public.upcoming_events for select
  to anon, authenticated
  using (status = 'published' and event_date >= current_date);

drop policy if exists upcoming_events_admin_manage on public.upcoming_events;
create policy upcoming_events_admin_manage
  on public.upcoming_events for all
  to authenticated
  using (public.is_tech_inside_admin())
  with check (public.is_tech_inside_admin());

grant select on public.upcoming_events to anon, authenticated;
grant insert, update on public.upcoming_events to authenticated;
