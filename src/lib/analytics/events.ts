import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type AnalyticsEventName =
  | 'page_view'
  | 'prompt_view'
  | 'prompt_copy'
  | 'prompt_save'
  | 'prompt_like'
  | 'prompt_share'
  | 'search'
  | 'signup'
  | 'login'
  | 'checkout_started'
  | 'subscription_start'
  | 'subscription_cancel'
  | 'payment_success'
  | 'payment_fail'

export interface TrackEventParams {
  eventName: AnalyticsEventName
  anonymousId?: string
  userId?: string
  sessionId?: string
  promptId?: string
  page?: string
  properties?: Record<string, unknown>
}

function createFingerprint(params: TrackEventParams): string {
  const parts = [
    params.eventName,
    params.promptId ?? '',
    params.anonymousId ?? '',
    params.sessionId ?? '',
  ]
  return createHash('sha256').update(parts.join('|')).digest('hex')
}

export async function trackEvent(params: TrackEventParams): Promise<void> {
  try {
    const fingerprint = createFingerprint(params)
    const timeBucket = new Date().toISOString().slice(0, 13) + ':00:00Z'

    // Check dedup
    const { data: existing } = await admin
      .from('analytics_event_dedup')
      .select('id')
      .eq('fingerprint', fingerprint)
      .maybeSingle()

    if (existing) return // duplicate event

    // Insert event
    await admin.from('analytics_events').insert({
      event_name: params.eventName,
      anonymous_id: params.anonymousId ?? null,
      user_id: params.userId ?? null,
      session_id: params.sessionId ?? null,
      prompt_id: params.promptId ?? null,
      page: params.page ?? null,
      properties: params.properties ?? {},
    })

    // Insert dedup record
    await admin.from('analytics_event_dedup').insert({
      fingerprint,
      event_name: params.eventName,
      prompt_id: params.promptId ?? null,
      anonymous_id: params.anonymousId ?? null,
      time_bucket: timeBucket,
    })
  } catch (err) {
    // Analytics should never block the main operation
    console.error('[analytics] Failed to track event:', err)
  }
}

export async function queryEvents(options: {
  eventName?: AnalyticsEventName
  promptId?: string
  userId?: string
  startDate?: string
  endDate?: string
  limit?: number
} = {}) {
  let query = admin
    .from('analytics_events')
    .select('*')
    .order('created_at', { ascending: false })

  if (options.eventName) query = query.eq('event_name', options.eventName)
  if (options.promptId) query = query.eq('prompt_id', options.promptId)
  if (options.userId) query = query.eq('user_id', options.userId)
  if (options.startDate) query = query.gte('created_at', options.startDate)
  if (options.endDate) query = query.lte('created_at', options.endDate)

  query = query.limit(options.limit ?? 100)

  const { data, error } = await query
  if (error) throw new Error(`Failed to query events: ${error.message}`)
  return data
}
