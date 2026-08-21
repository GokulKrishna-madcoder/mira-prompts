-- Migration: Subscription Lifecycle Tables
-- Purpose: Authoritative subscription/entitlement system replacing profile-based status

-- Subscription Plans (source of truth for pricing - never hardcode in UI)
CREATE TABLE subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL, -- free, prime_monthly, prime_yearly, prime_lifetime
  name text NOT NULL,
  billing_interval text, -- monthly, yearly, null for one-time/lifetime
  amount integer NOT NULL DEFAULT 0, -- in paise (smallest currency unit)
  currency text NOT NULL DEFAULT 'INR',
  razorpay_plan_id text,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Subscriptions (user's subscription state - authoritative)
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id),
  provider text NOT NULL DEFAULT 'razorpay',
  provider_customer_id text,
  provider_subscription_id text,
  status text NOT NULL DEFAULT 'incomplete'
    CHECK (status IN ('incomplete', 'trialing', 'active', 'past_due', 'paused', 'cancelled', 'expired', 'completed')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  cancelled_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Subscription lifecycle events (audit trail)
CREATE TABLE subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  provider_event_id text,
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Payment transactions (authoritative payment records)
CREATE TABLE payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES subscriptions(id),
  plan_id uuid REFERENCES subscription_plans(id),
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'INR',
  provider text NOT NULL DEFAULT 'razorpay',
  provider_payment_id text,
  provider_order_id text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'captured', 'failed', 'refunded')),
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Refunds
CREATE TABLE refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES payment_transactions(id),
  user_id uuid NOT NULL REFERENCES profiles(id),
  amount integer NOT NULL,
  provider text NOT NULL DEFAULT 'razorpay',
  provider_refund_id text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processed', 'failed')),
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Entitlements (what a user can access - replaces profile.subscription_status checks)
CREATE TABLE entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  feature_key text NOT NULL, -- premium_prompt, copy_premium_prompt, advanced_search
  source text NOT NULL, -- subscription, lifetime, admin_grant
  subscription_id uuid REFERENCES subscriptions(id),
  active boolean NOT NULL DEFAULT true,
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  UNIQUE(user_id, feature_key, source)
);

-- Payment webhook events (idempotency + audit)
CREATE TABLE payment_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'razorpay',
  event_id text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  payload_hash text,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processing_status text NOT NULL DEFAULT 'received'
    CHECK (processing_status IN ('received', 'processing', 'processed', 'failed')),
  attempt_count integer NOT NULL DEFAULT 0,
  error_message text,
  UNIQUE(provider, event_id)
);

-- Rate limits (Supabase-backed)
CREATE TABLE rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL, -- e.g. "analytics:user123", "copy:session456"
  window_start timestamptz NOT NULL DEFAULT now(),
  count integer NOT NULL DEFAULT 1,
  max_count integer NOT NULL DEFAULT 60,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(key, window_start)
);

-- Seed subscription plans
INSERT INTO subscription_plans (key, name, billing_interval, amount, currency) VALUES
  ('free', 'Free', NULL, 0, 'INR'),
  ('prime_monthly', 'Prime Monthly', 'monthly', 9900, 'INR'),
  ('prime_yearly', 'Prime Yearly', 'yearly', 99900, 'INR'),
  ('prime_lifetime', 'Prime Lifetime', NULL, 299900, 'INR');

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_provider_sub_id ON subscriptions(provider_subscription_id);
CREATE INDEX idx_subscription_events_sub_id ON subscription_events(subscription_id);
CREATE INDEX idx_subscription_events_type ON subscription_events(event_type);
CREATE INDEX idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_provider_payment_id ON payment_transactions(provider_payment_id);
CREATE INDEX idx_refunds_transaction_id ON refunds(transaction_id);
CREATE INDEX idx_entitlements_user_id ON entitlements(user_id);
CREATE INDEX idx_entitlements_feature ON entitlements(feature_key);
CREATE INDEX idx_entitlements_active ON entitlements(user_id, feature_key, active) WHERE active = true;
CREATE INDEX idx_payment_webhook_events_provider_event ON payment_webhook_events(provider, event_id);
CREATE INDEX idx_payment_webhook_events_status ON payment_webhook_events(processing_status);
CREATE INDEX idx_rate_limits_key_window ON rate_limits(key, window_start);

-- RLS: subscription_plans (public read)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are viewable by everyone" ON subscription_plans FOR SELECT USING (true);
CREATE POLICY "Only admins can modify plans" ON subscription_plans FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);

-- RLS: subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all subscriptions" ON subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);
CREATE POLICY "Service role can manage subscriptions" ON subscriptions FOR ALL USING (auth.uid() IS NULL);

-- RLS: subscription_events
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view subscription events" ON subscription_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);
CREATE POLICY "Service role can manage subscription events" ON subscription_events FOR ALL USING (auth.uid() IS NULL);

-- RLS: payment_transactions
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON payment_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON payment_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);
CREATE POLICY "Service role can manage transactions" ON payment_transactions FOR ALL USING (auth.uid() IS NULL);

-- RLS: refunds
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own refunds" ON refunds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all refunds" ON refunds FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);
CREATE POLICY "Service role can manage refunds" ON refunds FOR ALL USING (auth.uid() IS NULL);

-- RLS: entitlements
ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own entitlements" ON entitlements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all entitlements" ON entitlements FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);
CREATE POLICY "Service role can manage entitlements" ON entitlements FOR ALL USING (auth.uid() IS NULL);

-- RLS: payment_webhook_events (service role only - no user access)
ALTER TABLE payment_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage webhook events" ON payment_webhook_events FOR ALL USING (auth.uid() IS NULL);

-- RLS: rate_limits (service role only)
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage rate limits" ON rate_limits FOR ALL USING (auth.uid() IS NULL);
