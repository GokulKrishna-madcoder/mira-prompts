'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const hasConsented = localStorage.getItem('analyticsConsent')
    if (!hasConsented) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('analyticsConsent', 'accepted')
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem('analyticsConsent', 'declined')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] max-w-6xl mx-auto animate-in slide-in-from-bottom-5 fade-in duration-700 ease-out">
      <div className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-2xl md:rounded-full px-5 py-5 md:px-8 md:py-3.5 flex flex-col md:flex-row items-center justify-between gap-5 md:gap-8">
        
        <p className="text-[13px] md:text-sm font-medium text-gray-600 leading-relaxed text-center md:text-left flex-1">
          We use analytics to improve search results and platform quality — including search queries, clicks, and time spent on pages. No data is sold. You can change this any time in your <Link href="/settings" className="text-red-500 hover:text-red-600 font-bold transition-colors">preferences</Link> or read our <Link href="/privacy" className="text-red-500 hover:text-red-600 font-bold transition-colors">Cookie Policy</Link>.
        </p>
        
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-center">
          <button
            onClick={handleDecline}
            className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-full shadow-sm transition-all active:scale-[0.98]"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 md:flex-none px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-full shadow-sm shadow-red-500/20 transition-all active:scale-[0.98]"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
