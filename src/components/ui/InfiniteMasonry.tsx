'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import MasonryGrid from './MasonryGrid'
import { fetchFeedBatch } from '@/lib/feed-actions'
import type { FeedConfig, FeedCursor } from '@/lib/feed-actions'
import type { PromptCard } from '@/types/prompt'

// ponytail: skeleton = gray rounded boxes matching card shape, nothing else
function SkeletonGrid() {
  return (
    <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 px-4 md:px-8 space-y-4 w-full animate-pulse">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="break-inside-avoid">
          <div
            className="bg-gray-200 rounded-[16px]"
            style={{ height: `${200 + (i % 4) * 60}px` }} // ponytail: varied heights for realistic skeleton
          />
          <div className="mt-2 h-4 bg-gray-200 rounded w-3/4" />
        </div>
      ))}
    </div>
  )
}

export default function InfiniteMasonry({
  initialPrompts,
  savedIds = [],
  isLoggedIn = false,
  feedConfig,
}: {
  initialPrompts: PromptCard[]
  savedIds?: string[]
  isLoggedIn?: boolean
  feedConfig: FeedConfig
}) {
  const [prompts, setPrompts] = useState<PromptCard[]>(initialPrompts)
  const [cursor, setCursor] = useState<FeedCursor | null>(null)
  const [hasMore, setHasMore] = useState(initialPrompts.length >= 50)
  const [loading, setLoading] = useState(false)
  const seenIds = useRef(new Set(initialPrompts.map(p => p.id)))
  const lockRef = useRef(false) // mutex: prevent simultaneous requests
  const triggerRef = useRef<HTMLDivElement>(null)

  // Build initial cursor from the last initial prompt
  const initialCursorBuilt = useRef(false)
  useEffect(() => {
    if (initialCursorBuilt.current || initialPrompts.length === 0) return
    initialCursorBuilt.current = true

    if (feedConfig.feedType === 'trending' || feedConfig.feedType === 'search') {
      setCursor({ id: '', sortValue: 0, offset: initialPrompts.length })
    } else {
      const last = initialPrompts[initialPrompts.length - 1]
      setCursor({
        id: last.id,
        sortValue: feedConfig.feedType === 'popular' ? (last.view_count ?? 0) : (last as any).created_at,
      })
    }
  }, [initialPrompts, feedConfig])

  // Reset when feedConfig changes (e.g., user switches tabs/categories)
  const configKey = JSON.stringify(feedConfig)
  const prevConfigKey = useRef(configKey)
  useEffect(() => {
    if (prevConfigKey.current !== configKey) {
      prevConfigKey.current = configKey
      setPrompts(initialPrompts)
      seenIds.current = new Set(initialPrompts.map(p => p.id))
      setHasMore(initialPrompts.length >= 50)
      initialCursorBuilt.current = false
      lockRef.current = false
    }
  }, [configKey, initialPrompts])

  const loadMore = useCallback(async () => {
    if (lockRef.current || !hasMore || !cursor) return
    lockRef.current = true
    setLoading(true)

    try {
      const result = await fetchFeedBatch(feedConfig, cursor)

      // Deduplicate
      const fresh = result.prompts.filter(p => !seenIds.current.has(p.id))
      fresh.forEach(p => seenIds.current.add(p.id))

      setPrompts(prev => [...prev, ...fresh])
      setCursor(result.nextCursor)
      setHasMore(result.hasMore)
    } catch {
      // ponytail: silently fail, user can scroll again
    } finally {
      setLoading(false)
      lockRef.current = false
    }
  }, [hasMore, cursor, feedConfig])

  // IntersectionObserver — fires loadMore when trigger div is near viewport
  useEffect(() => {
    const el = triggerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore()
      },
      { rootMargin: '800px' } // ponytail: pre-fetch 800px before bottom
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <>
      <MasonryGrid prompts={prompts} savedIds={savedIds} isLoggedIn={isLoggedIn} />

      {/* Skeleton loading indicator */}
      {loading && <div className="mt-4"><SkeletonGrid /></div>}

      {/* End of results */}
      {!hasMore && prompts.length > 0 && (
        <div className="flex flex-col items-center py-12 text-center">
          <div className="w-12 h-1 bg-gray-200 rounded-full mb-4" />
          <p className="text-sm text-gray-400 font-medium">You&apos;ve seen it all! 🎉</p>
        </div>
      )}

      {/* Invisible scroll trigger */}
      <div ref={triggerRef} className="h-1 w-full" />
    </>
  )
}
