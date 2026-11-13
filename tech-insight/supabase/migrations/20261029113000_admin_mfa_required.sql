create or replace function public.is_tech_inside_admin()
returns boolean
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if coalesce(auth.jwt() ->> 'aal', '') <> 'aal2' then
    return false;
  end if;

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
