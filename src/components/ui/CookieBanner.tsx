'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasConsented = localStorage.getItem('analyticsConsent')
    if (!hasConsented) {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('analyticsConsent', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:w-[420px] z-[100] animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="relative bg-white border border-gray-200 shadow-2xl rounded-2xl p-5 md:p-6 pr-10 flex flex-col gap-3">
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
        
        <p className="text-sm font-medium text-gray-600 leading-relaxed">
          We use analytics to improve search results and platform quality — including search queries, clicks, and time spent on pages. No data is sold. You can change this any time in your <Link href="/settings" className="text-black font-bold hover:underline transition-all">preferences</Link> or read our <Link href="/privacy" className="text-black font-bold hover:underline transition-all">Cookie Policy</Link>.
        </p>
        
        <div className="flex justify-end pt-1">
          <button
            onClick={handleDismiss}
            className="px-5 py-2 bg-black hover:bg-gray-800 text-white text-sm font-semibold rounded-full shadow-sm transition-all active:scale-[0.98]"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  )
}
