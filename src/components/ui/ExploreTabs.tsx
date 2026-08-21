'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const tabs = [
  { value: 'new', label: 'New' },
  { value: 'popular', label: 'Popular' },
  { value: 'trending', label: 'Trending' },
] as const

export default function ExploreTabs() {
  const searchParams = useSearchParams()
  const current = searchParams.get('tab') || 'new'

  return (
    <div id="explore-tabs" className="explore-tabs flex items-center gap-1 bg-gray-100 p-1 rounded-full w-fit">
      {tabs.map(t => (
        <Link
          key={t.value}
          href={t.value === 'new' ? '/explore' : `/explore?tab=${t.value}`}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
            current === t.value
              ? 'bg-black text-white shadow-sm'
              : 'text-gray-600 hover:text-black'
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  )
}
