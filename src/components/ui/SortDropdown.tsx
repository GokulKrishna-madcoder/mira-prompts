'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'trending', label: 'Trending' },
] as const

export default function SortDropdown() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('sort') || 'newest'
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'newest') params.delete('sort')
    else params.set('sort', value)
    router.push(`?${params.toString()}`)
    setOpen(false)
  }

  const activeLabel = sortOptions.find(o => o.value === current)?.label || 'Newest'

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        id="sort-dropdown-btn"
        onClick={() => setOpen(!open)}
        className="sort-dropdown-btn flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
      >
        {activeLabel}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div id="sort-dropdown-menu" className="sort-dropdown-menu absolute top-full right-0 mt-2 w-36 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-50 py-1">
          {sortOptions.map(o => (
            <button
              key={o.value}
              onClick={() => select(o.value)}
              className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                current === o.value
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
