'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRef } from 'react'
import { trackEvent } from '@/lib/analytics/track-client'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = inputRef.current?.value.trim()
    if (q) {
      trackEvent('search', { properties: { query: q } })
      router.push(`/?q=${encodeURIComponent(q)}`)
    } else {
      router.push('/')
    }
  }

  return (
    <form id="search-form" onSubmit={handleSubmit} className="search-form flex-1 w-full">
      <div id="search-input-wrapper" className="search-input-wrapper relative group">
        <div className="search-icon absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black">
          <Search className="w-5 h-5" strokeWidth={2.5} />
        </div>
        <input
          id="search-input"
          ref={inputRef}
          type="text"
          name="q"
          placeholder="Search"
          defaultValue={searchParams.get('q') || ''}
          className="search-input w-full h-12 pl-12 pr-4 bg-gray-100 hover:bg-gray-200 focus:bg-white border-2 border-transparent focus:border-blue-500 rounded-full text-base outline-none transition-all"
        />
      </div>
    </form>
  )
}
