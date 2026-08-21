import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type Subscription = {
  id: string
  user_id: string
  plan_id: string
  provider: string
  provider_customer_id: string | null
  provider_subscription_id: string | null
  status: string
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  cancelled_at: string | null
  ended_at: string | null
  created_at: string
  updated_at: string
}

export type SubscriptionEvent = {
  id: string
  subscription_id: string
  event_type: string
  provider_event_id: string | null
  payload: Record<string, unknown>
  created_at: string
}

export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  const { data } = await admin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data as Subscription | null
}

export async function getSubscriptionByProviderId(
  providerSubscriptionId: string
): Promise<Subscription | null> {
  const { data } = await admin
    .from('subscriptions')
    .select('*')
    .eq('provider_subscription_id', providerSubscriptionId)
    .maybeSingle()

  return data as Subscription | null
}

export async function upsertSubscription(sub: Partial<Subscription> & { user_id: string; plan_id: string }): Promise<Subscription> {
  const { data, error } = await admin
    .from('subscriptions')
    .upsert(sub, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw new Error(`Failed to upsert subscription: ${error.message}`)
  return data as Subscription
}

export async function logSubscriptionEvent(
  subscriptionId: string,
  eventType: string,
  payload: Record<string, unknown> = {}
): Promise<void> {
  await admin.from('subscription_events').insert({
    subscription_id: subscriptionId,
    event_type: eventType,
    payload,
  })
}

export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: string,
  updates: Record<string, unknown> = {}
): Promise<void> {
  await admin
    .from('subscriptions')
    .update({ status, updated_at: new Date().toISOString(), ...updates })
    .eq('id', subscriptionId)
}
