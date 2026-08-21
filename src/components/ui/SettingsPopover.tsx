'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Settings, X, ExternalLink } from 'lucide-react'

export default function SettingsPopover() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) {
      document.addEventListener('mousedown', handler)
    }
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative flex items-center justify-center w-full">
      <button
        onClick={() => setOpen(!open)}
        className={`sidebar-icon w-12 h-12 flex items-center justify-center rounded-full transition-all ${
          open 
            ? 'bg-black text-white shadow-md transform scale-105' 
            : 'text-gray-500 hover:bg-gray-100 hover:text-black'
        }`}
        aria-label="Settings and Support"
      >
        <Settings className="w-6 h-6" strokeWidth={2.5} />
      </button>

      {open && (
        <div className="absolute left-[64px] bottom-0 w-[300px] bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 z-50 overflow-hidden flex flex-col py-2 animate-in fade-in slide-in-from-left-4 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h3 className="font-bold text-xl text-black">Settings & Support</h3>
            <button 
              onClick={() => setOpen(false)} 
              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col px-3 pb-3">
            <Link 
              href="/settings" 
              onClick={() => setOpen(false)} 
              className="px-3 py-3 rounded-xl hover:bg-gray-100 text-black font-semibold text-[15px] transition-colors"
            >
              Settings
            </Link>
            
            <div className="my-2 h-px bg-gray-100 mx-2" />
            
            <span className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wide">
              Support & Legal
            </span>
            
            <Link 
              href="/about" 
              onClick={() => setOpen(false)} 
              className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-100 text-black font-semibold text-[15px] transition-colors group"
            >
              About Mira Prompts
            </Link>

            <Link 
              href="/privacy" 
              onClick={() => setOpen(false)} 
              className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-100 text-black font-semibold text-[15px] transition-colors group"
            >
              Privacy policy
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
            </Link>
            
            <Link 
              href="/terms" 
              onClick={() => setOpen(false)} 
              className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-100 text-black font-semibold text-[15px] transition-colors group"
            >
              Terms of service
              <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
