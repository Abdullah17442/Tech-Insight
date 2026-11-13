create table if not exists public.article_daily_view_counts (
  article_id uuid not null references public.blogs(id) on delete cascade,
  view_date date not null,
  total_views bigint not null default 0 check (total_views >= 0),
  primary key (article_id, view_date)
);

alter table public.article_daily_view_counts enable row level security;

revoke all on public.article_daily_view_counts
  from public, anon, authenticated;
grant select on public.article_daily_view_counts to authenticated;

drop policy if exists article_daily_view_counts_admin_read
  on public.article_daily_view_counts;
create policy article_daily_view_counts_admin_read
  on public.article_daily_view_counts for select
  to authenticated
  using (public.is_tech_inside_admin());

create or replace function public.record_article_view(p_article_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  utc_view_date date := (now() at time zone 'UTC')::date;
begin
  if not exists (
    select 1
    from public.blogs
    where id = p_article_id
      and (
        status = 'published'
        or (status = 'scheduled' and published_at <= now())
      )
  ) then
    return;
  end if;

  insert into public.article_view_counts as view_counts (
    article_id,
    total_views,
    updated_at
  )
  values (p_article_id, 1, now())
  on conflict (article_id) do update
    set total_views = view_counts.total_views + 1,
        updated_at = now();

  insert into public.article_daily_view_counts as daily_counts (
    article_id,
    view_date,
    total_views
  )
  values (p_article_id, utc_view_date, 1)
  on conflict (article_id, view_date) do update
    set total_views = daily_counts.total_views + 1;
end;
$$;

revoke all on function public.record_article_view(uuid)
  from public, anon, authenticated;
grant execute on function public.record_article_view(uuid)
  to anon, authenticated;

create or replace function public.reset_article_views()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if coalesce(auth.jwt() ->> 'aal', '') <> 'aal2'
    or not public.is_tech_inside_admin() then
    raise exception 'Only an MFA-verified admin can reset article views.'
      using errcode = '42501';
  end if;

  truncate table
    public.article_daily_view_counts,
    public.article_view_counts;
end;
$$;

revoke all on function public.reset_article_views()
  from public, anon, authenticated;
grant execute on function public.reset_article_views()
  to authenticated;
