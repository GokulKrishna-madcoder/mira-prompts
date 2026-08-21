'use client'

import { useOptimistic, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { toggleLike } from '@/lib/user-actions'
import { trackEvent } from '@/lib/analytics/track-client'

export default function LikeButton({ promptId, initialLiked, initialCount = 0 }: { promptId: string, initialLiked: boolean, initialCount?: number }) {
  const [isPending, startTransition] = useTransition()
  const [optimisticState, addOptimisticState] = useOptimistic(
    { liked: initialLiked, count: initialCount },
    (state, newLiked: boolean) => ({ 
      liked: newLiked, 
      count: newLiked ? state.count + 1 : Math.max(0, state.count - 1) 
    })
  )

  const handleToggle = () => {
    startTransition(async () => {
      const willLike = !optimisticState.liked
      addOptimisticState(willLike)
      try {
        await toggleLike(promptId)
        trackEvent('prompt_like', { promptId, properties: { action: willLike ? 'like' : 'unlike' } })
      } catch (err) {
        // Revert on error is handled implicitly by useOptimistic discarding its state
      }
    })
  }

  return (
    <button
      id={`btn-like-${promptId}`}
      onClick={handleToggle}
      disabled={isPending}
      className={`group flex items-center gap-1.5 px-3 py-2 rounded-full font-semibold transition-all ${
        optimisticState.liked 
          ? 'text-red-500 hover:bg-red-50' 
          : 'text-gray-900 hover:bg-gray-100'
      }`}
    >
      <Heart 
        className={`w-5 h-5 transition-transform group-hover:scale-110 ${optimisticState.liked ? 'fill-current' : ''}`} 
        strokeWidth={2.5} 
      />
      <span className="text-base">{optimisticState.count > 0 ? optimisticState.count : ''}</span>
    </button>
  )
}
