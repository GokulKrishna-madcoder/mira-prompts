import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type RateLimitConfig = {
  maxRequests: number
  windowSeconds: number
}

const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  'analytics:track': { maxRequests: 60, windowSeconds: 60 },
  'copy:premium': { maxRequests: 10, windowSeconds: 3600 },
  'search:query': { maxRequests: 30, windowSeconds: 60 },
  'auth:login': { maxRequests: 5, windowSeconds: 300 },
  'auth:signup': { maxRequests: 3, windowSeconds: 3600 },
  'payment:verify': { maxRequests: 5, windowSeconds: 300 },
  'ticket:create': { maxRequests: 3, windowSeconds: 3600 },
  'api:general': { maxRequests: 120, windowSeconds: 60 },
}

function getWindowStart(windowSeconds: number): string {
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const windowStart = new Date(now - (now % windowMs))
  return windowStart.toISOString()
}

export async function checkRateLimit(
  key: string,
  config?: Partial<RateLimitConfig>
): Promise<{ allowed: boolean; remaining: number; resetAt: string }> {
  const limits = { ...DEFAULT_LIMITS['api:general'], ...config }
  const windowStart = getWindowStart(limits.windowSeconds)

  // Try to increment counter
  const { data, error } = await admin
    .from('rate_limits')
    .upsert(
      {
        key,
        window_start: windowStart,
        count: 1,
        max_count: limits.maxRequests,
      },
      {
        onConflict: 'key,window_start',
        ignoreDuplicates: false,
      }
    )
    .select('count, max_count')
    .single()

  if (error) {
    // If upsert fails, try to increment
    const { data: existing } = await admin
      .from('rate_limits')
      .select('count, max_count')
      .eq('key', key)
      .eq('window_start', windowStart)
      .single()

    if (existing) {
      const newCount = existing.count + 1
      await admin
        .from('rate_limits')
        .update({ count: newCount })
        .eq('key', key)
        .eq('window_start', windowStart)

      const resetAt = new Date(
        new Date(windowStart).getTime() + limits.windowSeconds * 1000
      ).toISOString()

      return {
        allowed: newCount <= existing.max_count,
        remaining: Math.max(0, existing.max_count - newCount),
        resetAt,
      }
    }

    // Fallback: allow the request
    return { allowed: true, remaining: limits.maxRequests, resetAt: '' }
  }

  // Increment the count
  const newCount = (data?.count ?? 0) + 1
  await admin
    .from('rate_limits')
    .update({ count: newCount })
    .eq('key', key)
    .eq('window_start', windowStart)

  const resetAt = new Date(
    new Date(windowStart).getTime() + limits.windowSeconds * 1000
  ).toISOString()

  return {
    allowed: newCount <= limits.maxRequests,
    remaining: Math.max(0, limits.maxRequests - newCount),
    resetAt,
  }
}

export async function cleanupOldRateLimits(): Promise<number> {
  const cutoff = new Date(Date.now() - 24 * 3600 * 1000).toISOString()

  const { count } = await admin
    .from('rate_limits')
    .delete()
    .lt('window_start', cutoff)

  return count ?? 0
}
