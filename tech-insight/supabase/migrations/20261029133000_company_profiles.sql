create table if not exists public.company_profiles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  industry text not null,
  description text not null,
  website text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists company_profiles_name_idx
  on public.company_profiles (name);

drop trigger if exists company_profiles_set_updated_at on public.company_profiles;
create trigger company_profiles_set_updated_at
before update on public.company_profiles
for each row execute function public.set_tech_inside_updated_at();

alter table public.company_profiles enable row level security;

drop policy if exists company_profiles_public_read on public.company_profiles;
create policy company_profiles_public_read
  on public.company_profiles for select
  to anon, authenticated
  using (true);

drop policy if exists company_profiles_admin_manage on public.company_profiles;
create policy company_profiles_admin_manage
  on public.company_profiles for all
  to authenticated
  using (public.is_tech_inside_admin())
  with check (public.is_tech_inside_admin());

grant select on public.company_profiles to anon, authenticated;
grant insert, update, delete on public.company_profiles to authenticated;

insert into public.company_profiles (
  name, slug, industry, description, website, logo_url
)
values
  (
    'NVIDIA',
    'nvidia',
    'Semiconductors · AI · Data Centers',
    'NVIDIA builds accelerated computing platforms used across AI, data centers, and advanced computing.',
    'https://www.nvidia.com/en-us/about-nvidia/',
    'https://cdn.jsdelivr.net/npm/simple-icons@v14/icons/nvidia.svg'
  ),
  (
    'Google',
    'google',
    'Technology · Cloud · AI',
    'Google develops internet services, cloud platforms, and artificial intelligence products.',
    'https://about.google/',
    'https://cdn.jsdelivr.net/npm/simple-icons@v14/icons/google.svg'
  ),
  (
    'Microsoft',
    'microsoft',
    'Technology · Cloud · AI',
    'Microsoft builds software, cloud infrastructure, and AI tools for people and organizations.',
    'https://www.microsoft.com/en-us/about',
    'https://www.google.com/s2/favicons?domain=microsoft.com&sz=128'
  ),
  (
    'Amazon',
    'amazon',
    'Technology · Cloud · E-commerce',
    'Amazon operates online services and commerce, including the AWS cloud computing platform.',
    'https://www.aboutamazon.com/',
    'https://cdn.jsdelivr.net/npm/simple-icons@v14/icons/amazon.svg'
  ),
  (
    'Meta',
    'meta',
    'Technology · AI · Social Media',
    'Meta develops social platforms, virtual reality products, and artificial intelligence technology.',
    'https://about.meta.com/',
    'https://cdn.jsdelivr.net/npm/simple-icons@v14/icons/meta.svg'
  ),
  (
    'OpenAI',
    'openai',
    'Artificial Intelligence · Software',
    'OpenAI researches and develops artificial intelligence systems and tools.',
    'https://openai.com/about/',
    'https://cdn.jsdelivr.net/npm/simple-icons@v14/icons/openai.svg'
  )
on conflict (slug) do nothing;
