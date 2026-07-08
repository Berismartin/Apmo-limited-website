-- Product image uploads for the Apmo admin portal.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'apmo_bucket',
  'apmo_bucket',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Apmo product images are publicly readable" on storage.objects;
create policy "Apmo product images are publicly readable"
on storage.objects for select
using (bucket_id = 'apmo_bucket');

drop policy if exists "Apmo product images are admin insertable" on storage.objects;
create policy "Apmo product images are admin insertable"
on storage.objects for insert
with check (
  bucket_id = 'apmo_bucket'
  and public.is_admin()
);

drop policy if exists "Apmo product images are admin updatable" on storage.objects;
create policy "Apmo product images are admin updatable"
on storage.objects for update
using (
  bucket_id = 'apmo_bucket'
  and public.is_admin()
)
with check (
  bucket_id = 'apmo_bucket'
  and public.is_admin()
);

drop policy if exists "Apmo product images are admin deletable" on storage.objects;
create policy "Apmo product images are admin deletable"
on storage.objects for delete
using (
  bucket_id = 'apmo_bucket'
  and public.is_admin()
);