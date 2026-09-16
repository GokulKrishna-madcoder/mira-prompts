-- Phase 2: Search RPCs and Reciprocal Rank Fusion (RRF)
-- ponytail: Minimalist RRF and autocomplete. No unnecessary JSON mapping, just unified fast queries.

-- 1. Autocomplete / Suggestions (Fast Prefix + Trigram)
-- Returns max 12 items unified so frontend doesn't have to merge them.
CREATE OR REPLACE FUNCTION get_search_suggestions(p_query text)
RETURNS TABLE (type text, label text, slug text, image_url text) AS $$
BEGIN
  RETURN QUERY
  (
    SELECT 'category'::text, name, slug, cover_image_url 
    FROM categories 
    WHERE name ILIKE p_query || '%' OR name % p_query 
    LIMIT 3
  )
  UNION ALL
  (
    SELECT 'tag'::text, name, slug, NULL::text 
    FROM tags 
    WHERE name ILIKE p_query || '%' OR name % p_query 
    LIMIT 4
  )
  UNION ALL
  (
    SELECT 'prompt'::text, title, slug, p.image_url 
    FROM prompts p
    WHERE status = 'published' 
      AND (title ILIKE p_query || '%' OR title % p_query) 
    ORDER BY view_count DESC 
    LIMIT 5
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;


-- 2. Hybrid Search Engine (FTS + Vector Semantic + Popularity Boost)
-- ponytail: RRF math combines exact keyword hits with vector similarity. 
-- Popularity is a log10 multiplier so 1M views only boosts by 6x vs 1x for 0 views.
CREATE OR REPLACE FUNCTION hybrid_search_prompts(
  p_query text,
  p_embedding vector(384) DEFAULT NULL,
  match_limit int DEFAULT 30
)
RETURNS TABLE (prompt_id uuid) AS $$
BEGIN
  RETURN QUERY
  WITH fts_matches AS (
    SELECT id, row_number() over (order by ts_rank(fts_document, websearch_to_tsquery('english', p_query)) desc) as rank
    FROM prompts
    WHERE status = 'published' 
      AND (
        fts_document @@ websearch_to_tsquery('english', p_query)
        OR title ILIKE '%' || p_query || '%'
      )
    LIMIT 100
  ),
  vec_matches AS (
    SELECT id, row_number() over (order by embedding <=> p_embedding) as rank
    FROM prompts
    WHERE status = 'published' 
      AND p_embedding IS NOT NULL
    LIMIT 100
  ),
  combined AS (
    SELECT
      COALESCE(f.id, v.id) as cid,
      -- RRF Formula: 1 / (k + rank). We use k=60.
      (CASE WHEN f.rank IS NOT NULL THEN 1.0 / (60.0 + f.rank) ELSE 0.0 END) +
      (CASE WHEN v.rank IS NOT NULL THEN 1.0 / (60.0 + v.rank) ELSE 0.0 END) as rrf_score
    FROM fts_matches f
    FULL OUTER JOIN vec_matches v ON f.id = v.id
  )
  SELECT c.cid
  FROM combined c
  JOIN prompts p ON p.id = c.cid
  -- Logarithmic popularity boost: log10(max(10, view_count)). 
  -- 10 views = 1.0x multiplier, 100 views = 2.0x, 10,000 = 4.0x.
  ORDER BY (c.rrf_score * log(10.0, GREATEST(10.0, p.view_count::numeric))) DESC
  LIMIT match_limit;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
