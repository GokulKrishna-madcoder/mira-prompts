-- Migration: Prompt Variants Engine
-- Adds has_variants flag, JSONB variants column, and variant_type discriminator

ALTER TABLE prompts ADD COLUMN IF NOT EXISTS has_variants BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT NULL;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS variant_type TEXT NOT NULL DEFAULT 'standard';

-- Backfill existing gender variants
UPDATE prompts SET variant_type = 'gender' WHERE has_variants = true AND variant_type = 'standard';

CREATE OR REPLACE FUNCTION search_prompt_ids(search_term text)
RETURNS TABLE (prompt_id uuid) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.id
  FROM prompts p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN prompt_tags pt ON pt.prompt_id = p.id
  LEFT JOIN tags t ON t.id = pt.tag_id
  WHERE
    p.title ILIKE '%' || search_term || '%'
    OR p.prompt ILIKE '%' || search_term || '%'
    OR c.name ILIKE '%' || search_term || '%'
    OR t.name ILIKE '%' || search_term || '%'
    OR (
       p.has_variants = true AND
       p.variants::text ILIKE '%' || search_term || '%'
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
