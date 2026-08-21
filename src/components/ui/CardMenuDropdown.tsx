'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Link as LinkIcon, Download, Share } from 'lucide-react'

export default function CardMenuDropdown({ slug, imageUrl }: { slug: string, imageUrl: string }) {
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

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/prompts/${slug}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => { setCopied(false); setIsOpen(false) }, 1500)
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `prompt-${slug}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      setIsOpen(false)
    } catch (err) {
      window.open(imageUrl, '_blank')
      setIsOpen(false)
    }
  }

  const handleNativeShare = async () => {
    const url = `${window.location.origin}/prompts/${slug}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this prompt',
          url: url
        })
      } catch (err) {
        // Ignored, user cancelled or error
      }
    } else {
      handleCopyLink()
    }
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="prompt-card-menu w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 shrink-0 text-gray-700 transition-colors"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-10 right-0 w-48 bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-2 z-50">
          
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCopyLink() }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <LinkIcon className="w-4 h-4 text-gray-600" />
            {copied ? 'Copied!' : 'Copy link'}
          </button>

          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDownload() }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4 text-gray-600" />
            Download image
          </button>

          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleNativeShare() }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Share className="w-4 h-4 text-gray-600" />
            Share
          </button>
          
        </div>
      )}
    </div>
  )
}
