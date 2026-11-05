do $$
declare
  has_location boolean;
  has_company_name boolean;
begin
  if to_regclass('public.upcoming_events') is null then
    raise exception 'public.upcoming_events does not exist; apply the upcoming_events migration first';
  end if;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'upcoming_events'
      and column_name = 'location'
  ) into has_location;

  select exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'upcoming_events'
      and column_name = 'company_name'
  ) into has_company_name;

  if has_location and not has_company_name then
    alter table public.upcoming_events
      rename column location to company_name;
  elsif has_location and has_company_name then
    update public.upcoming_events
    set company_name = coalesce(nullif(btrim(company_name), ''), location);

    alter table public.upcoming_events
      drop column location;
  elsif not has_company_name then
    alter table public.upcoming_events
      add column company_name text not null default '';

    alter table public.upcoming_events
      alter column company_name drop default;
  end if;
end;
$$;
