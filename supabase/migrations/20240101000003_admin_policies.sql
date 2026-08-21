-- Admin/Editor write policies for prompts
create policy "Admins/editors can insert prompts." on prompts for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'editor'))
);
create policy "Admins/editors can update prompts." on prompts for update using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'editor'))
);
create policy "Admins can delete prompts." on prompts for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Admin/Editor write policies for categories
create policy "Admins/editors can insert categories." on categories for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'editor'))
);
create policy "Admins can delete categories." on categories for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Admin/Editor write policies for tags
create policy "Admins/editors can insert tags." on tags for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'editor'))
);
create policy "Admins can delete tags." on tags for delete using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Admin/Editor write policies for prompt_tags
create policy "Admins/editors can insert prompt_tags." on prompt_tags for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'editor'))
);
create policy "Admins/editors can delete prompt_tags." on prompt_tags for delete using (
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'editor'))
);

-- Allow prompt_views/copies insert for everyone (analytics tracking)
alter table prompt_views enable row level security;
alter table prompt_copies enable row level security;

create policy "Anyone can insert prompt_views." on prompt_views for insert with check (true);
create policy "Anyone can insert prompt_copies." on prompt_copies for insert with check (true);
