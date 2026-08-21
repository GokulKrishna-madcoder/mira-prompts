import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type Entitlement = {
  id: string
  user_id: string
  feature_key: string
  source: string
  subscription_id: string | null
  active: boolean
  granted_at: string
  expires_at: string | null
}

export type FeatureKey = 'premium_prompt' | 'copy_premium_prompt' | 'advanced_search'

export async function getUserEntitlements(userId: string): Promise<Entitlement[]> {
  const { data } = await admin
    .from('entitlements')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .or('expires_at.is.null,expires_at.gt.now()')

  return (data as Entitlement[]) ?? []
}

export async function hasEntitlement(userId: string, featureKey: FeatureKey): Promise<boolean> {
  const { data } = await admin
    .from('entitlements')
    .select('id')
    .eq('user_id', userId)
    .eq('feature_key', featureKey)
    .eq('active', true)
    .or('expires_at.is.null,expires_at.gt.now()')
    .limit(1)
    .maybeSingle()

  return !!data
}

export async function grantEntitlement(
  userId: string,
  featureKey: FeatureKey,
  source: string,
  subscriptionId?: string,
  expiresAt?: string
): Promise<void> {
  await admin.from('entitlements').upsert(
    {
      user_id: userId,
      feature_key: featureKey,
      source,
      subscription_id: subscriptionId ?? null,
      active: true,
      expires_at: expiresAt ?? null,
    },
    { onConflict: 'user_id,feature_key,source' }
  )
}

export async function revokeEntitlement(
  userId: string,
  featureKey: FeatureKey,
  source: string
): Promise<void> {
  await admin
    .from('entitlements')
    .update({ active: false, revoked_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('feature_key', featureKey)
    .eq('source', source)
}

export async function syncEntitlementsFromSubscription(
  userId: string,
  subscriptionId: string,
  planKey: string,
  active: boolean
): Promise<void> {
  if (active) {
    // Grant premium features
    await grantEntitlement(userId, 'premium_prompt', 'subscription', subscriptionId)
    await grantEntitlement(userId, 'copy_premium_prompt', 'subscription', subscriptionId)
    await grantEntitlement(userId, 'advanced_search', 'subscription', subscriptionId)
  } else {
    // Revoke subscription-sourced entitlements
    await revokeEntitlement(userId, 'premium_prompt', 'subscription')
    await revokeEntitlement(userId, 'copy_premium_prompt', 'subscription')
    await revokeEntitlement(userId, 'advanced_search', 'subscription')
  }
}
