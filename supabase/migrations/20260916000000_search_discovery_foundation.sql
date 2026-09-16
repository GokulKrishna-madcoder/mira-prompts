-- Phase 1: Search Discovery Foundation
-- Extensions, FTS column, vector column, search_history table, indexes

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add tsvector generated column for full-text search
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS fts_document tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(prompt, '')), 'C')
  ) STORED;

-- 3. Add embedding column (384-d for gte-small / all-MiniLM-L6-v2)
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS embedding vector(384);

-- 4. GIN index on fts_document for fast full-text search
CREATE INDEX IF NOT EXISTS idx_prompts_fts ON prompts USING GIN (fts_document);

-- 5. Trigram indexes for fuzzy autocomplete on tags and categories
CREATE INDEX IF NOT EXISTS idx_tags_name_trgm ON tags USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_categories_name_trgm ON categories USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_prompts_title_trgm ON prompts USING GIN (title gin_trgm_ops);

-- 6. HNSW index for fast vector similarity search
-- ponytail: using ivfflat if <1000 rows, switch to hnsw when row count grows
CREATE INDEX IF NOT EXISTS idx_prompts_embedding ON prompts USING hnsw (embedding vector_cosine_ops);

-- 7. search_history table
CREATE TABLE IF NOT EXISTS search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  query text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Unique constraint: one row per user+query, upsert bumps created_at
CREATE UNIQUE INDEX IF NOT EXISTS idx_search_history_user_query ON search_history (user_id, query);

-- RLS: users see only their own searches
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own searches" ON search_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own searches" ON search_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own searches" ON search_history
  FOR DELETE USING (auth.uid() = user_id);

-- 8. Trim search_history to max 15 per user on insert
CREATE OR REPLACE FUNCTION trim_search_history()
RETURNS trigger AS $$
BEGIN
  DELETE FROM search_history
  WHERE id IN (
    SELECT id FROM search_history
    WHERE user_id = NEW.user_id
    ORDER BY created_at DESC
    OFFSET 15
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_trim_search_history ON search_history;
CREATE TRIGGER trg_trim_search_history
  AFTER INSERT ON search_history
  FOR EACH ROW EXECUTE FUNCTION trim_search_history();

-- 9. RPC: log a recent search (upsert, deduplicates automatically)
CREATE OR REPLACE FUNCTION log_recent_search(p_query text)
RETURNS void AS $$
BEGIN
  INSERT INTO search_history (user_id, query, created_at)
  VALUES (auth.uid(), lower(trim(p_query)), now())
  ON CONFLICT (user_id, query)
  DO UPDATE SET created_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. RPC: get recent searches for logged-in user
CREATE OR REPLACE FUNCTION get_recent_searches(p_limit int DEFAULT 10)
RETURNS TABLE (query text, created_at timestamptz) AS $$
BEGIN
  RETURN QUERY
  SELECT sh.query, sh.created_at
  FROM search_history sh
  WHERE sh.user_id = auth.uid()
  ORDER BY sh.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 11. RPC: clear all recent searches for logged-in user
CREATE OR REPLACE FUNCTION clear_recent_searches()
RETURNS void AS $$
BEGIN
  DELETE FROM search_history WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
