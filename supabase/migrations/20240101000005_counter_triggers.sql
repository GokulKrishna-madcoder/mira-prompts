create or replace function public.increment_prompt_view()
returns trigger as $$
begin
  update public.prompts set view_count = view_count + 1 where id = new.prompt_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_prompt_view_inserted
  after insert on public.prompt_views
  for each row execute procedure public.increment_prompt_view();

create or replace function public.increment_prompt_copy()
returns trigger as $$
begin
  update public.prompts set copy_count = copy_count + 1 where id = new.prompt_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_prompt_copy_inserted
  after insert on public.prompt_copies
  for each row execute procedure public.increment_prompt_copy();
