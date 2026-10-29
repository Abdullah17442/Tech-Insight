insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'article-images',
  'article-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists article_images_public_read on storage.objects;
create policy article_images_public_read
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'article-images');

drop policy if exists article_images_admin_insert on storage.objects;
create policy article_images_admin_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'article-images'
    and public.is_tech_inside_admin()
  );

drop policy if exists article_images_admin_update on storage.objects;
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

drop policy if exists article_images_admin_delete on storage.objects;
create policy article_images_admin_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'article-images'
    and public.is_tech_inside_admin()
  );
