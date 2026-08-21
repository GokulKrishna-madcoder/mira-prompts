'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Flag, Link as LinkIcon, Download } from 'lucide-react'

export default function MoreOptionsDropdown({ promptId, promptUrl, imageUrl }: { promptId: string, promptUrl: string, imageUrl: string }) {
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

  const fullUrl = typeof window !== 'undefined' ? window.location.origin + promptUrl : promptUrl

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => { setCopied(false); setIsOpen(false) }, 1500)
  }

  const handleDownload = () => {
    window.open(imageUrl, '_blank')
    setIsOpen(false)
  }

  const handleReport = () => {
    window.location.href = 'mailto:miraprompts@gmail.com?subject=Report Prompt ' + promptId + '&body=I would like to report this prompt: ' + fullUrl
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="btn-more-options"
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 flex items-center justify-center rounded-full text-gray-900 hover:bg-gray-100 transition-colors focus:bg-gray-100"
      >
        <MoreHorizontal className="w-6 h-6" strokeWidth={2.5} />
      </button>

      {isOpen && (
        <div id="more-options-dropdown-menu" className="absolute top-12 right-0 w-48 bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl p-2 z-50">
          <button 
            onClick={handleCopy}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <LinkIcon className="w-4 h-4 text-gray-500" />
            {copied ? 'Copied!' : 'Copy link'}
          </button>

          <button 
            onClick={handleDownload}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4 text-gray-500" />
            Open Image
          </button>
          
          <div className="my-1 h-px bg-gray-100 mx-2" />

          <button 
            onClick={handleReport}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <Flag className="w-4 h-4" />
            Report
          </button>
        </div>
      )}
    </div>
  )
}
