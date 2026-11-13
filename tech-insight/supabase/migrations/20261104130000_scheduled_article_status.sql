alter table public.blogs
  drop constraint if exists blogs_status_check;

alter table public.blogs
  add constraint blogs_status_check
  check (status in ('draft', 'published', 'scheduled'));
