-- Users can read their own saves
create policy "Users can read own saves." on prompt_saves for select using (
  auth.uid() = user_id
);

-- Users can insert their own saves
create policy "Users can insert own saves." on prompt_saves for insert with check (
  auth.uid() = user_id
);

-- Users can delete their own saves
create policy "Users can delete own saves." on prompt_saves for delete using (
  auth.uid() = user_id
);
