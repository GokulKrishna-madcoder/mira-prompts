'use client'

import { toggleSave } from '@/lib/user-actions'
import { useOptimistic, useTransition } from 'react'
import { Bookmark } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/track-client'

export default function SaveButton({ promptId, initialSaved, variant = 'card' }: {
  promptId: string
  initialSaved: boolean
  variant?: 'card' | 'detail'
}) {
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(initialSaved)
  const [pending, startTransition] = useTransition()

  const handleSave = () => {
    startTransition(async () => {
      const willSave = !optimisticSaved
      setOptimisticSaved(willSave)
      await toggleSave(promptId)
      trackEvent('prompt_save', { promptId, properties: { action: willSave ? 'save' : 'unsave' } })
    })
  }

  if (variant === 'card') {
    return (
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSave() }}
        disabled={pending}
        className={`px-4 py-3 font-bold rounded-full text-sm transition-colors ${
          optimisticSaved
            ? 'bg-black text-white'
            : 'bg-red-600 text-white hover:bg-red-700'
        }`}
      >
        {optimisticSaved ? 'Saved' : 'Save'}
      </button>
    )
  }

  return (
    <button
      onClick={handleSave}
      disabled={pending}
      className={`flex items-center gap-2 px-5 py-3 font-semibold rounded-full text-sm transition-colors ${
        optimisticSaved
          ? 'bg-black text-white'
          : 'bg-gray-200 text-black hover:bg-gray-300'
      }`}
    >
      <Bookmark className="w-4 h-4" fill={optimisticSaved ? 'currentColor' : 'none'} />
      {optimisticSaved ? 'Saved' : 'Save'}
    </button>
  )
}
