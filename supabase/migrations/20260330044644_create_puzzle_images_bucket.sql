-- Create storage bucket for user-uploaded puzzle images

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'puzzle-images',
  'puzzle-images',
  true,
  10485760, -- 10 MB
  array['image/png', 'image/jpeg', 'image/gif', 'image/webp']
);

-- Authenticated users can upload under their own user ID prefix
create policy "puzzle_images_insert_authenticated"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'puzzle-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public read access for all puzzle images
create policy "puzzle_images_select_anon"
  on storage.objects
  for select
  to anon
  using (bucket_id = 'puzzle-images');

create policy "puzzle_images_select_authenticated"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'puzzle-images');

-- Authenticated users can delete their own uploads
create policy "puzzle_images_delete_authenticated"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'puzzle-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
