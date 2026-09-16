-- Phase 2.1 Hotfix: Fix search autocomplete strictness
-- Make the suggestions dropdown match keywords anywhere in the string (ILIKE '%term%') 
-- instead of just the exact prefix, and also search the prompt text.

CREATE OR REPLACE FUNCTION get_search_suggestions(p_query text)
RETURNS TABLE (type text, label text, slug text, image_url text) AS $$
BEGIN
  RETURN QUERY
  (
    SELECT 'category'::text, name, slug, cover_image_url 
    FROM categories 
    WHERE name ILIKE '%' || p_query || '%' 
       OR name % p_query 
    LIMIT 3
  )
  UNION ALL
  (
    SELECT 'tag'::text, name, slug, NULL::text 
    FROM tags 
    WHERE name ILIKE '%' || p_query || '%' 
       OR name % p_query 
    LIMIT 4
  )
  UNION ALL
  (
    SELECT 'prompt'::text, title, slug, p.image_url 
    FROM prompts p
    WHERE status = 'published' 
      AND (
        title ILIKE '%' || p_query || '%' 
        OR prompt ILIKE '%' || p_query || '%'
        OR fts_document @@ websearch_to_tsquery('english', p_query)
      ) 
    ORDER BY view_count DESC 
    LIMIT 5
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
