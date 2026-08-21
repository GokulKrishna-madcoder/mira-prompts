-- Migration: Audit, SEO, Analytics Tables
-- Purpose: Admin audit trail, SEO slug history, trusted analytics pipeline

-- Admin Audit Log (every privileged mutation must be auditable)
CREATE TABLE admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb NOT NULL DEFAULT '{}',
  ip_hash text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Prompt Slug History (for 301 redirects when slugs change)
CREATE TABLE prompt_slug_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  old_slug text NOT NULL,
  new_slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Analytics Events (trusted pipeline - never write directly from browser)
CREATE TABLE analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  anonymous_id text,
  user_id uuid REFERENCES profiles(id),
  session_id text,
  prompt_id uuid REFERENCES prompts(id),
  page text,
  properties jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Analytics Event Dedup (fingerprint-based deduplication)
CREATE TABLE analytics_event_dedup (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint text UNIQUE NOT NULL,
  event_name text NOT NULL,
  prompt_id uuid,
  anonymous_id text,
  time_bucket timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Daily Platform Metrics (precomputed aggregation)
CREATE TABLE daily_platform_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  total_users integer NOT NULL DEFAULT 0,
  active_users integer NOT NULL DEFAULT 0,
  new_signups integer NOT NULL DEFAULT 0,
  published_prompts integer NOT NULL DEFAULT 0,
  total_views integer NOT NULL DEFAULT 0,
  total_copies integer NOT NULL DEFAULT 0,
  total_saves integer NOT NULL DEFAULT 0,
  total_searches integer NOT NULL DEFAULT 0,
  paid_users integer NOT NULL DEFAULT 0,
  mrr numeric NOT NULL DEFAULT 0,
  arr numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Daily Prompt Metrics (per-prompt daily aggregation)
CREATE TABLE daily_prompt_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  prompt_id uuid NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  views integer NOT NULL DEFAULT 0,
  copies integer NOT NULL DEFAULT 0,
  saves integer NOT NULL DEFAULT 0,
  shares integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(date, prompt_id)
);

-- Daily Category Metrics (per-category daily aggregation)
CREATE TABLE daily_category_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  views integer NOT NULL DEFAULT 0,
  copies integer NOT NULL DEFAULT 0,
  prompts integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(date, category_id)
);

-- Daily Subscription Metrics (daily subscription aggregation)
CREATE TABLE daily_subscription_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  new_subscriptions integer NOT NULL DEFAULT 0,
  cancellations integer NOT NULL DEFAULT 0,
  renewals integer NOT NULL DEFAULT 0,
  refunds integer NOT NULL DEFAULT 0,
  mrr numeric NOT NULL DEFAULT 0,
  arr numeric NOT NULL DEFAULT 0,
  churn_rate numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Trending Scores (precomputed trending rankings)
CREATE TABLE prompt_trending_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id uuid NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  window_size text NOT NULL CHECK (window_size IN ('today', 'week', 'month')),
  score numeric NOT NULL DEFAULT 0,
  computed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(prompt_id, window_size)
);

-- Indexes
CREATE INDEX idx_admin_audit_logs_actor ON admin_audit_logs(actor_user_id);
CREATE INDEX idx_admin_audit_logs_action ON admin_audit_logs(action);
CREATE INDEX idx_admin_audit_logs_resource ON admin_audit_logs(resource_type, resource_id);
CREATE INDEX idx_admin_audit_logs_created ON admin_audit_logs(created_at DESC);
CREATE INDEX idx_prompt_slug_history_prompt_id ON prompt_slug_history(prompt_id);
CREATE INDEX idx_prompt_slug_history_old_slug ON prompt_slug_history(old_slug);
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_prompt_id ON analytics_events(prompt_id);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_event_dedup_fingerprint ON analytics_event_dedup(fingerprint);
CREATE INDEX idx_analytics_event_dedup_time ON analytics_event_dedup(time_bucket);
CREATE INDEX idx_daily_prompt_metrics_date ON daily_prompt_metrics(date DESC);
CREATE INDEX idx_daily_prompt_metrics_prompt_id ON daily_prompt_metrics(prompt_id);
CREATE INDEX idx_daily_category_metrics_date ON daily_category_metrics(date DESC);
CREATE INDEX idx_prompt_trending_scores_window ON prompt_trending_scores(window_size, score DESC);
CREATE INDEX idx_prompt_trending_scores_prompt_id ON prompt_trending_scores(prompt_id);

-- RLS: admin_audit_logs
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON admin_audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);
CREATE POLICY "Service role can insert audit logs" ON admin_audit_logs FOR INSERT WITH CHECK (auth.uid() IS NULL);
CREATE POLICY "Admins can insert audit logs" ON admin_audit_logs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- RLS: prompt_slug_history
ALTER TABLE prompt_slug_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Slug history is viewable by everyone" ON prompt_slug_history FOR SELECT USING (true);
CREATE POLICY "Service role can manage slug history" ON prompt_slug_history FOR ALL USING (auth.uid() IS NULL);

-- RLS: analytics_events (service role only for writes, admins for reads)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage analytics events" ON analytics_events FOR ALL USING (auth.uid() IS NULL);
CREATE POLICY "Admins can view analytics events" ON analytics_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- RLS: analytics_event_dedup (service role only)
ALTER TABLE analytics_event_dedup ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage dedup records" ON analytics_event_dedup FOR ALL USING (auth.uid() IS NULL);

-- RLS: daily metrics (admin read, service role write)
ALTER TABLE daily_platform_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view platform metrics" ON daily_platform_metrics FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);
CREATE POLICY "Service role can manage platform metrics" ON daily_platform_metrics FOR ALL USING (auth.uid() IS NULL);

ALTER TABLE daily_prompt_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view prompt metrics" ON daily_prompt_metrics FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);
CREATE POLICY "Service role can manage prompt metrics" ON daily_prompt_metrics FOR ALL USING (auth.uid() IS NULL);

ALTER TABLE daily_category_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view category metrics" ON daily_category_metrics FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);
CREATE POLICY "Service role can manage category metrics" ON daily_category_metrics FOR ALL USING (auth.uid() IS NULL);

ALTER TABLE daily_subscription_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view subscription metrics" ON daily_subscription_metrics FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);
CREATE POLICY "Service role can manage subscription metrics" ON daily_subscription_metrics FOR ALL USING (auth.uid() IS NULL);

-- RLS: prompt_trending_scores (public read, service role write)
ALTER TABLE prompt_trending_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Trending scores are viewable by everyone" ON prompt_trending_scores FOR SELECT USING (true);
CREATE POLICY "Service role can manage trending scores" ON prompt_trending_scores FOR ALL USING (auth.uid() IS NULL);
