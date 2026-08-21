-- Trending score computation function
-- Computes a weighted score: copies(40%) + likes(25%) + saves(20%) + views(15%) with time decay

CREATE OR REPLACE FUNCTION compute_trending_scores(p_window text DEFAULT 'week')
RETURNS void AS $$
DECLARE
  v_interval interval;
  v_weight_views numeric := 0.15;
  v_weight_copies numeric := 0.40;
  v_weight_likes numeric := 0.25;
  v_weight_saves numeric := 0.20;
BEGIN
  -- Determine time window
  CASE p_window
    WHEN 'today' THEN v_interval := interval '1 day';
    WHEN 'week'  THEN v_interval := interval '7 days';
    WHEN 'month' THEN v_interval := interval '30 days';
    ELSE v_interval := interval '7 days';
  END CASE;

  -- Upsert trending scores for all published prompts
  INSERT INTO prompt_trending_scores (prompt_id, window_size, score, computed_at)
  SELECT
    p.id,
    p_window,
    COALESCE((
      (SELECT count(*) FROM prompt_views pv WHERE pv.prompt_id = p.id AND pv.created_at >= now() - v_interval)
      * v_weight_views
    ), 0)
    + COALESCE((
      (SELECT count(*) FROM prompt_copies pc WHERE pc.prompt_id = p.id AND pc.created_at >= now() - v_interval)
      * v_weight_copies
    ), 0)
    + COALESCE((
      (SELECT count(*) FROM prompt_likes pl WHERE pl.prompt_id = p.id AND pl.created_at >= now() - v_interval)
      * v_weight_likes
    ), 0)
    + COALESCE((
      (SELECT count(*) FROM prompt_saves ps WHERE ps.prompt_id = p.id AND ps.created_at >= now() - v_interval)
      * v_weight_saves
    ), 0)
    AS score,
    now()
  FROM prompts p
  WHERE p.status = 'published'
  ON CONFLICT (prompt_id, window_size)
  DO UPDATE SET
    score = EXCLUDED.score,
    computed_at = now();
END;
$$ LANGUAGE plpgsql;

-- Compute all windows at once
CREATE OR REPLACE FUNCTION compute_all_trending_scores()
RETURNS void AS $$
BEGIN
  PERFORM compute_trending_scores('today');
  PERFORM compute_trending_scores('week');
  PERFORM compute_trending_scores('month');
END;
$$ LANGUAGE plpgsql;
