-- Enable the pg_cron extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the trending computation to run every hour at minute 0
SELECT cron.schedule(
  'mira-trending-computation', -- name of the cron job
  '0 * * * *',                 -- every hour (e.g. 1:00, 2:00, 3:00)
  'SELECT compute_all_trending_scores();'
);
