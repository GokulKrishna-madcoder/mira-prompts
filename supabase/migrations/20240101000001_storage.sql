-- Create Storage Buckets
insert into storage.buckets (id, name, public) values ('prompt-images', 'prompt-images', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('prompt-thumbnails', 'prompt-thumbnails', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;

-- Set up Storage RLS Policies

-- Public viewing for all buckets
create policy "Prompt images are publicly accessible." on storage.objects for select using (bucket_id = 'prompt-images');
create policy "Prompt thumbnails are publicly accessible." on storage.objects for select using (bucket_id = 'prompt-thumbnails');
create policy "Avatars are publicly accessible." on storage.objects for select using (bucket_id = 'avatars');

-- Admin/Editor upload access (assuming service role for most uploads, but just in case we allow authenticated uploads)
create policy "Admins/Editors can upload prompt images." on storage.objects for insert with check (
  bucket_id = 'prompt-images' and auth.role() = 'authenticated' and
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'))
);

create policy "Admins/Editors can upload thumbnails." on storage.objects for insert with check (
  bucket_id = 'prompt-thumbnails' and auth.role() = 'authenticated' and
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'))
);

-- Users can upload their own avatars
create policy "Users can upload their own avatars." on storage.objects for insert with check (
  bucket_id = 'avatars' and auth.role() = 'authenticated' and 
  (storage.foldername(name))[1] = auth.uid()::text
);
