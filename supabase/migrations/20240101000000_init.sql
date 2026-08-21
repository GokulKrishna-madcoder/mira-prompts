-- 1. profiles
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'editor', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  cover_image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 3. prompts
create table prompts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  prompt text not null,
  image_url text not null,
  thumbnail_url text,
  category_id uuid references categories(id) on delete set null,
  model text,
  aspect_ratio text,
  style text,
  source_name text,
  source_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_featured boolean not null default false,
  view_count bigint not null default 0,
  copy_count bigint not null default 0,
  save_count bigint not null default 0,
  created_by uuid references profiles(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. tags
create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- 5. prompt_tags
create table prompt_tags (
  prompt_id uuid references prompts(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (prompt_id, tag_id)
);

-- 6. collections
create table collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. collection_items
create table collection_items (
  collection_id uuid references collections(id) on delete cascade,
  prompt_id uuid references prompts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (collection_id, prompt_id)
);

-- 8. prompt_saves
create table prompt_saves (
  user_id uuid references profiles(id) on delete cascade,
  prompt_id uuid references prompts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, prompt_id)
);

-- 9. prompt_views
create table prompt_views (
  id bigint generated always as identity primary key,
  prompt_id uuid not null references prompts(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  session_id text,
  created_at timestamptz not null default now()
);

-- 10. prompt_copies
create table prompt_copies (
  id bigint generated always as identity primary key,
  prompt_id uuid not null references prompts(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  session_id text,
  created_at timestamptz not null default now()
);

-- 11. Important Indexes
create index prompts_status_idx on prompts(status);
create index prompts_category_idx on prompts(category_id);
create index prompts_created_at_idx on prompts(created_at desc);
create index prompts_featured_idx on prompts(is_featured) where is_featured = true;
create index prompt_tags_tag_idx on prompt_tags(tag_id);
create index prompt_views_prompt_idx on prompt_views(prompt_id);
create index prompt_copies_prompt_idx on prompt_copies(prompt_id);

-- Enable RLS
alter table profiles enable row level security;
alter table categories enable row level security;
alter table prompts enable row level security;
alter table tags enable row level security;
alter table prompt_tags enable row level security;
alter table collections enable row level security;
alter table collection_items enable row level security;
alter table prompt_saves enable row level security;

-- Setup RLS Policies

-- Profiles
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Categories & Tags
create policy "Categories are viewable by everyone." on categories for select using (true);
create policy "Tags are viewable by everyone." on tags for select using (true);

-- Prompts
create policy "Published prompts are viewable by everyone." on prompts for select using (status = 'published');
create policy "Draft/Archived prompts are viewable by admins/editors or creator." on prompts for select using (
  auth.uid() = created_by or 
  exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'editor'))
);

-- Prompt Tags
create policy "Prompt tags are viewable by everyone." on prompt_tags for select using (true);

-- Collections & Saves
create policy "Users can view their own collections." on collections for select using (auth.uid() = user_id);
create policy "Users can insert their own collections." on collections for insert with check (auth.uid() = user_id);
create policy "Users can update their own collections." on collections for update using (auth.uid() = user_id);
create policy "Users can delete their own collections." on collections for delete using (auth.uid() = user_id);

create policy "Users can view their own collection items." on collection_items for select using (
  exists (select 1 from collections where id = collection_items.collection_id and user_id = auth.uid())
);
create policy "Users can manage their own collection items." on collection_items for all using (
  exists (select 1 from collections where id = collection_items.collection_id and user_id = auth.uid())
);

create policy "Users can view their own saves." on prompt_saves for select using (auth.uid() = user_id);
create policy "Users can insert their own saves." on prompt_saves for insert with check (auth.uid() = user_id);
create policy "Users can delete their own saves." on prompt_saves for delete using (auth.uid() = user_id);
