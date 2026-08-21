'use client'

import { useState, useRef, useEffect } from 'react'
import { Share, Link as LinkIcon, MessageCircle } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/track-client'

const IconFacebook = (props: any) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const IconTwitter = (props: any) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
)

const IconInstagram = (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
)

export default function ShareDropdown({ promptUrl }: { promptUrl: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${promptUrl}` : promptUrl

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    trackEvent('prompt_share', { page: promptUrl, properties: { method: 'copy_link' } })
    setTimeout(() => { setCopied(false); setIsOpen(false) }, 1500)
  }

  const handleShareClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this prompt',
          url: fullUrl
        })
        trackEvent('prompt_share', { page: promptUrl, properties: { method: 'native_os_share' } })
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      setIsOpen(!isOpen)
    }
  }

  const shareLinks = [
    { name: 'WhatsApp', icon: MessageCircle, url: `https://wa.me/?text=${encodeURIComponent('Check out this prompt: ' + fullUrl)}`, color: 'text-green-500' },
    { name: 'Copy for Instagram', icon: IconInstagram, url: `https://instagram.com`, color: 'text-pink-600', isIg: true },
    { name: 'X (Twitter)', icon: IconTwitter, url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent('Check out this amazing prompt!')}`, color: 'text-black' },
    { name: 'Facebook', icon: IconFacebook, url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`, color: 'text-blue-600' },
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="btn-share-trigger"
        onClick={handleShareClick}
        className="w-10 h-10 flex items-center justify-center rounded-full text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <Share className="w-5 h-5" strokeWidth={2.5} />
      </button>

      {isOpen && (
        <div id="share-dropdown-menu" className="absolute top-12 left-1/2 -translate-x-1/2 w-56 bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-2 z-50">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">Share</h4>
          
          <button 
            onClick={handleCopy}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <LinkIcon className="w-4 h-4 text-gray-600" />
            </div>
            {copied ? 'Copied!' : 'Copy link'}
          </button>

          {shareLinks.map(link => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                trackEvent('prompt_share', { page: promptUrl, properties: { method: link.name } })
                if (link.isIg) {
                  e.preventDefault()
                  handleCopy()
                  window.open(link.url, '_blank')
                } else {
                  setIsOpen(false)
                }
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <link.icon className={`w-4 h-4 ${link.color}`} fill={link.name === 'Facebook' ? 'currentColor' : 'none'} />
              </div>
              {link.name}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
