'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics/track-client'

export default function ViewTracker({ id }: { id: string }) {
  useEffect(() => {
    // Only track once per page load to avoid duplicate counts in strict mode
    const tracked = sessionStorage.getItem(`tracked_view_${id}`)
    if (!tracked) {
      fetch(`/api/prompts/${id}/view`, { method: 'POST' }).catch(() => {})
      trackEvent('prompt_view', { promptId: id })
      sessionStorage.setItem(`tracked_view_${id}`, 'true')
    }
  }, [id])

  return null
}
