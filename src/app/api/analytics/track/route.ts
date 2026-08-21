import { NextResponse } from 'next/server'
import { trackEvent, type AnalyticsEventName } from '@/lib/analytics/events'
import { checkRateLimit } from '@/lib/ratelimit'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { event, promptId, page, properties, anonymousId, sessionId } = body as {
      event: AnalyticsEventName
      promptId?: string
      page?: string
      properties?: Record<string, unknown>
      anonymousId?: string
      sessionId?: string
    }

    if (!event) {
      return NextResponse.json({ error: 'Missing event name' }, { status: 400 })
    }

    // Rate limit by anonymous ID or IP
    const rateLimitKey = `analytics:${anonymousId || request.headers.get('x-forwarded-for') || 'unknown'}`
    const { allowed } = await checkRateLimit(rateLimitKey, {
      maxRequests: 60,
      windowSeconds: 60,
    })

    if (!allowed) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 })
    }

    // Fire and forget — don't block the response
    trackEvent({
      eventName: event,
      promptId,
      page,
      properties,
      anonymousId,
      sessionId,
    }).catch(() => {})

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true })
  }
}
