import { createHash } from 'crypto'

const ANALYTICS_API = process.env.NEXT_PUBLIC_ANALYTICS_API_URL
const ANALYTICS_KEY = process.env.ANALYTICS_WRITE_KEY

export function getAnonymousId(): string {
  if (typeof window === 'undefined') return ''

  let anonId = localStorage.getItem('mira_anonymous_id')
  if (!anonId) {
    anonId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem('mira_anonymous_id', anonId)
  }
  return anonId
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = sessionStorage.getItem('mira_session_id')
  if (!sessionId) {
    sessionId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
    sessionStorage.setItem('mira_session_id', sessionId)
  }
  return sessionId
}

export function hashForAnalytics(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 16)
}

export async function sendToAnalytics(
  event: string,
  properties: Record<string, unknown> = {}
): Promise<void> {
  if (!ANALYTICS_API || !ANALYTICS_KEY) return

  try {
    await fetch(ANALYTICS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ANALYTICS_KEY}`,
      },
      body: JSON.stringify({
        event,
        anonymousId: getAnonymousId(),
        sessionId: getSessionId(),
        properties,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch {
    // Analytics should never fail the main operation
  }
}
