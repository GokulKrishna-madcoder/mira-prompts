-- Daily metrics aggregation function
-- Aggregates raw event data into daily_platform_metrics

CREATE OR REPLACE FUNCTION aggregate_daily_metrics(p_date date DEFAULT CURRENT_DATE - 1)
RETURNS void AS $$
DECLARE
  v_day_start timestamptz;
  v_day_end timestamptz;
  v_views integer;
  v_copies integer;
  v_saves integer;
  v_searches integer;
  v_signups integer;
  v_total_users integer;
  v_paid_users integer;
  v_published_prompts integer;
  v_mrr numeric;
BEGIN
  v_day_start := p_date::timestamptz;
  v_day_end := (p_date + interval '1 day')::timestamptz - interval '1 second';

  -- Count raw events for the day
  SELECT count(*) INTO v_views FROM prompt_views WHERE created_at BETWEEN v_day_start AND v_day_end;
  SELECT count(*) INTO v_copies FROM prompt_copies WHERE created_at BETWEEN v_day_start AND v_day_end;
  SELECT count(*) INTO v_saves FROM prompt_saves WHERE created_at BETWEEN v_day_start AND v_day_end;
  SELECT count(*) INTO v_searches FROM analytics_events WHERE event_name = 'search' AND created_at BETWEEN v_day_start AND v_day_end;
  SELECT count(*) INTO v_signups FROM analytics_events WHERE event_name = 'signup' AND created_at BETWEEN v_day_start AND v_day_end;

  -- Totals
  SELECT count(*) INTO v_total_users FROM profiles;
  SELECT count(*) INTO v_paid_users FROM profiles WHERE subscription_status IN ('active', 'lifetime');
  SELECT count(*) INTO v_published_prompts FROM prompts WHERE status = 'published';

  -- MRR natively from profiles
  SELECT COALESCE(SUM(
    CASE
      WHEN subscription_tier = 'yearly' THEN 1999.0 / 12.0
      WHEN subscription_tier = 'monthly' THEN 199.0
      ELSE 0
    END
  ), 0) INTO v_mrr
  FROM profiles
  WHERE subscription_status = 'active';

  -- Upsert
  INSERT INTO daily_platform_metrics (
    date, total_users, active_users, new_signups, published_prompts,
    total_views, total_copies, total_saves, total_searches,
    paid_users, mrr, arr
  ) VALUES (
    p_date, v_total_users, 0, v_signups, v_published_prompts,
    v_views, v_copies, v_saves, v_searches,
    v_paid_users, v_mrr, v_mrr * 12
  )
  ON CONFLICT (date) DO UPDATE SET
    total_users = EXCLUDED.total_users,
    active_users = EXCLUDED.active_users,
    new_signups = EXCLUDED.new_signups,
    published_prompts = EXCLUDED.published_prompts,
    total_views = EXCLUDED.total_views,
    total_copies = EXCLUDED.total_copies,
    total_saves = EXCLUDED.total_saves,
    total_searches = EXCLUDED.total_searches,
    paid_users = EXCLUDED.paid_users,
    mrr = EXCLUDED.mrr,
    arr = EXCLUDED.arr;
END;
$$ LANGUAGE plpgsql;

-- Backfill function: aggregates all days with raw data but no daily_metrics row
CREATE OR REPLACE FUNCTION backfill_missing_daily_metrics()
RETURNS void AS $$
DECLARE
  v_date date;
BEGIN
  FOR v_date IN
    SELECT DISTINCT date_trunc('day', created_at)::date
    FROM prompt_views
    WHERE NOT EXISTS (
      SELECT 1 FROM daily_platform_metrics dpm WHERE dpm.date = date_trunc('day', created_at)::date
    )
    UNION
    SELECT DISTINCT date_trunc('day', created_at)::date
    FROM analytics_events
    WHERE NOT EXISTS (
      SELECT 1 FROM daily_platform_metrics dpm WHERE dpm.date = date_trunc('day', created_at)::date
    )
    ORDER BY 1
  LOOP
    PERFORM aggregate_daily_metrics(v_date);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule daily aggregation via pg_cron (runs at 00:05 UTC every day)
SELECT cron.schedule(
  'aggregate-daily-metrics',
  '5 0 * * *',
  $$SELECT aggregate_daily_metrics(CURRENT_DATE - 1)$$
);

-- Initial backfill
SELECT backfill_missing_daily_metrics();
