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
