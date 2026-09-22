'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, ChevronDown } from 'lucide-react'

export default function DateRangeFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentFrom = searchParams.get('from') || ''
  const currentTo = searchParams.get('to') || ''

  const [isOpen, setIsOpen] = useState(false)
  const [from, setFrom] = useState(currentFrom)
  const [to, setTo] = useState(currentTo)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const applyRange = (newFrom: string, newTo: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newFrom) params.set('from', newFrom)
    else params.delete('from')
    
    if (newTo) params.set('to', newTo)
    else params.delete('to')

    router.push(`?${params.toString()}`)
    setIsOpen(false)
  }

  const setQuickRange = (days: number | null) => {
    if (days === null) {
      setFrom('')
      setTo('')
      applyRange('', '')
      return
    }
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)
    
    const fromStr = start.toISOString().split('T')[0]
    const toStr = end.toISOString().split('T')[0]
    
    setFrom(fromStr)
    setTo(toStr)
    applyRange(fromStr, toStr)
  }

  const label = currentFrom && currentTo 
    ? `${new Date(currentFrom).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${new Date(currentTo).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
    : 'All Time'

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button (Pinterest Pill Style) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-black text-sm font-bold rounded-full transition-colors"
      >
        <Calendar className="w-4 h-4" />
        {label}
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-xl border border-gray-100 p-5 z-50">
          <h3 className="text-sm font-bold text-black mb-3">Quick Filters</h3>
          <div className="flex flex-wrap gap-2 mb-5">
            <button onClick={() => setQuickRange(7)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black text-xs font-bold rounded-full transition-colors">Last 7 Days</button>
            <button onClick={() => setQuickRange(30)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black text-xs font-bold rounded-full transition-colors">Last 30 Days</button>
            <button onClick={() => setQuickRange(90)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black text-xs font-bold rounded-full transition-colors">Last 90 Days</button>
            <button onClick={() => setQuickRange(null)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-black text-xs font-bold rounded-full transition-colors">All Time</button>
          </div>

          <h3 className="text-sm font-bold text-black mb-3">Custom Range</h3>
          <div className="space-y-3 mb-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">From</label>
              <input 
                type="date" 
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl text-sm font-medium text-black focus:ring-2 focus:ring-gray-200 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">To</label>
              <input 
                type="date" 
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border-none rounded-2xl text-sm font-medium text-black focus:ring-2 focus:ring-gray-200 outline-none"
              />
            </div>
          </div>

          <button 
            onClick={() => applyRange(from, to)}
            className="w-full py-3 bg-black hover:bg-gray-900 text-white text-sm font-bold rounded-full transition-colors"
          >
            Apply Filter
          </button>
        </div>
      )}
    </div>
  )
}
