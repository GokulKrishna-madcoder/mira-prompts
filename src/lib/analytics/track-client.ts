'use client'

import type { AnalyticsEventName } from '@/lib/analytics/events'

function getAnonymousId(): string {
  if (typeof window === 'undefined') return ''
  let id = localStorage.getItem('mira_anonymous_id')
  if (!id) {
    id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.setItem('mira_anonymous_id', id)
  }
  return id
}

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let id = sessionStorage.getItem('mira_session_id')
  if (!id) {
    id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
    sessionStorage.setItem('mira_session_id', id)
  }
  return id
}

export function trackEvent(
  event: AnalyticsEventName,
  options: { promptId?: string; page?: string; properties?: Record<string, unknown> } = {}
) {
  const anonymousId = getAnonymousId()
  const sessionId = getSessionId()

  fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event,
      anonymousId,
      sessionId,
      ...options,
    }),
  }).catch(() => {})
}
