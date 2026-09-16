'use client'

import { Search, X, Clock, Tag, Grid3X3, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics/track-client'
import Image from 'next/image'

type Suggestion = { type: string; label: string; slug: string; image_url: string | null }

export default function SearchBar() {
  const router = useRouter()
  const supabase = createClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(-1) // keyboard selection index
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [recents, setRecents] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch recent searches on focus
  const fetchRecents = useCallback(async () => {
    const { data } = await supabase.rpc('get_recent_searches', { p_limit: 8 })
    if (data) setRecents(data.map((r: { query: string }) => r.query))
  }, [supabase])

  // Debounced suggestions fetch
  useEffect(() => {
    if (query.length < 3) { setSuggestions([]); return }

    const timer = setTimeout(async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setLoading(true)
      try {
        const { data } = await supabase.rpc('get_search_suggestions', { p_query: query })
        if (!controller.signal.aborted && data) {
          setSuggestions(data)
          trackEvent('search', { properties: { action: 'suggestions_shown', query, count: data.length } })
        }
      } catch { /* aborted or error, ignore */ }
      setLoading(false)
    }, 300) // ponytail: 300ms debounce, good enough

    return () => clearTimeout(timer)
  }, [query, supabase])

  // Build the unified items list for keyboard nav
  const items: { type: string; label: string; href: string; image?: string | null }[] = []

  if (query.length < 3 && recents.length > 0) {
    recents.forEach(r => items.push({ type: 'recent', label: r, href: `/search?q=${encodeURIComponent(r)}` }))
  }
  suggestions.forEach(s => {
    if (s.type === 'category') items.push({ type: 'category', label: s.label, href: `/categories/${s.slug}` })
    else if (s.type === 'tag') items.push({ type: 'tag', label: s.label, href: `/tags/${s.slug}` })
    else if (s.type === 'prompt') items.push({ type: 'prompt', label: s.label, href: `/prompts/${s.slug}`, image: s.image_url })
  })

  const navigate = (href: string, label: string, type: string) => {
    trackEvent('search', { properties: { action: `${type}_suggestion_clicked`, query, label } })
    // Log search for logged-in users (fire-and-forget)
    supabase.rpc('log_recent_search', { p_query: query || label }).then(() => {})
    setOpen(false)
    setQuery('')
    if (inputRef.current) inputRef.current.value = ''
    router.push(href)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return

    if (idx >= 0 && idx < items.length) {
      navigate(items[idx].href, items[idx].label, items[idx].type)
    } else {
      trackEvent('search', { properties: { action: 'search_submitted', query: q } })
      supabase.rpc('log_recent_search', { p_query: q }).then(() => {})
      setOpen(false)
      router.push(`/search?q=${encodeURIComponent(q)}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || items.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIdx(i => (i + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIdx(i => (i <= 0 ? items.length - 1 : i - 1))
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  const clearRecents = async () => {
    await supabase.rpc('clear_recent_searches')
    setRecents([])
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const iconForType = (type: string) => {
    if (type === 'recent') return <Clock className="w-4 h-4 text-gray-400 shrink-0" />
    if (type === 'category') return <Grid3X3 className="w-4 h-4 text-purple-500 shrink-0" />
    if (type === 'tag') return <Tag className="w-4 h-4 text-blue-500 shrink-0" />
    return <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
  }

  return (
    <div ref={dropdownRef} className="relative flex-1 w-full">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-black">
            <Search className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search prompts, categories, tags..."
            autoComplete="off"
            className="w-full h-12 pl-12 pr-10 bg-gray-100 hover:bg-gray-200 focus:bg-white border-2 border-transparent focus:border-black rounded-full text-base outline-none transition-all"
            value={query}
            onChange={e => { setQuery(e.target.value); setIdx(-1); if (!open) setOpen(true) }}
            onFocus={() => { setOpen(true); fetchRecents(); trackEvent('search', { properties: { action: 'search_opened' } }) }}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-activedescendant={idx >= 0 ? `search-item-${idx}` : undefined}
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus() }} className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-black">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {open && items.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-[70vh] overflow-y-auto" role="listbox">
          
          {/* Recent searches header */}
          {query.length < 3 && recents.length > 0 && (
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent</span>
              <button onClick={clearRecents} className="text-xs font-semibold text-gray-400 hover:text-black transition-colors">Clear all</button>
            </div>
          )}

          {/* Suggestion section headers */}
          {query.length >= 3 && suggestions.some(s => s.type === 'category' || s.type === 'tag') && (
            <div className="px-4 pt-3 pb-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Suggestions</span>
            </div>
          )}

          {/* Non-prompt items (categories, tags, recents) */}
          {items.filter(i => i.type !== 'prompt').map((item, i) => {
            const realIdx = items.indexOf(item)
            return (
              <button
                key={`${item.type}-${item.label}`}
                id={`search-item-${realIdx}`}
                role="option"
                aria-selected={idx === realIdx}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors ${idx === realIdx ? 'bg-gray-100 text-black' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => navigate(item.href, item.label, item.type)}
                onMouseEnter={() => setIdx(realIdx)}
              >
                {iconForType(item.type)}
                <span className="truncate">{item.label}</span>
                {item.type === 'category' && <span className="ml-auto text-xs text-gray-400 shrink-0">Category</span>}
                {item.type === 'tag' && <span className="ml-auto text-xs text-gray-400 shrink-0">Tag</span>}
              </button>
            )
          })}

          {/* Prompt results */}
          {items.some(i => i.type === 'prompt') && (
            <>
              <div className="px-4 pt-3 pb-1 border-t border-gray-50">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Prompts</span>
              </div>
              {items.filter(i => i.type === 'prompt').map((item) => {
                const realIdx = items.indexOf(item)
                return (
                  <button
                    key={`prompt-${item.label}`}
                    id={`search-item-${realIdx}`}
                    role="option"
                    aria-selected={idx === realIdx}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${idx === realIdx ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                    onClick={() => navigate(item.href, item.label, item.type)}
                    onMouseEnter={() => setIdx(realIdx)}
                  >
                    {item.image && (
                      <Image src={item.image} alt="" width={40} height={40} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    )}
                    <span className="text-sm font-medium text-gray-700 truncate">{item.label}</span>
                  </button>
                )
              })}
            </>
          )}

          {/* Search for query CTA */}
          {query.length >= 3 && (
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-black border-t border-gray-100 hover:bg-gray-50 transition-colors"
              onClick={() => { handleSubmit({ preventDefault: () => {} } as any) }}
            >
              <Search className="w-4 h-4 shrink-0" />
              Search for &quot;{query}&quot;
            </button>
          )}
        </div>
      )}
    </div>
  )
}
