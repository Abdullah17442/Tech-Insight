create table if not exists public.article_view_counts (
  article_id uuid primary key references public.blogs(id) on delete cascade,
  total_views bigint not null default 0 check (total_views >= 0),
  updated_at timestamptz not null default now()
);

alter table public.article_view_counts enable row level security;

revoke all on public.article_view_counts from public, anon, authenticated;
grant select on public.article_view_counts to authenticated;

drop policy if exists article_view_counts_admin_read
  on public.article_view_counts;
create policy article_view_counts_admin_read
  on public.article_view_counts for select
  to authenticated
  using (public.is_tech_inside_admin());

create or replace function public.record_article_view(p_article_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.article_view_counts as view_counts (
    article_id,
    total_views,
    updated_at
  )
  select blogs.id, 1, now()
  from public.blogs
  where blogs.id = p_article_id
    and (
      blogs.status = 'published'
      or (
        blogs.status = 'scheduled'
        and blogs.published_at <= now()
      )
    )
  on conflict (article_id) do update
      set total_views = view_counts.total_views + 1,
        updated_at = now();
end;
$$;

revoke all on function public.record_article_view(uuid)
  from public, anon, authenticated;
grant execute on function public.record_article_view(uuid)
  to anon, authenticated;
