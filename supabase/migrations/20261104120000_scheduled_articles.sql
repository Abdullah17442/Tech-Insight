drop policy if exists blogs_public_published_read on public.blogs;

create policy blogs_public_published_read
  on public.blogs for select
  to anon, authenticated
  using (
    status = 'published'
    or (status = 'scheduled' and published_at <= now())
  );

create or replace function public.list_upcoming_blogs()
returns table (
  id uuid,
  title text,
  subtitle text,
  slug text,
  image_url text,
  category text,
  published_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    blogs.id,
    blogs.title,
    blogs.subtitle,
    blogs.slug,
    blogs.image_url,
    blogs.category,
    blogs.published_at
  from public.blogs
  where blogs.status = 'scheduled'
    and blogs.published_at > now()
  order by blogs.published_at asc;
$$;

revoke all on function public.list_upcoming_blogs() from public;
grant execute on function public.list_upcoming_blogs() to anon, authenticated;
