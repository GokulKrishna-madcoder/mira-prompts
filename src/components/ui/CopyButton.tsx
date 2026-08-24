'use client'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { trackEvent } from '@/lib/analytics/track-client'

export default function CopyButton({ text, id, variant = 'default' }: { text: string, id: string, variant?: 'default' | 'massive' }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    trackEvent('prompt_copy', { promptId: id })
    fetch(`/api/prompts/${id}/copy`, { method: 'POST' }).catch(() => {})
  }

  if (variant === 'massive') {
    return (
      <button
        id={`btn-copy-massive-${id}`}
        onClick={handleCopy}
        className={`relative w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-bold rounded-[20px] transition-all duration-300 ${
          copied 
            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/25 scale-[0.98]' 
            : 'bg-gray-100 hover:bg-gray-200 text-black'
        }`}
      >
        {copied && <span className="absolute inset-0 rounded-[20px] ring-4 ring-rose-500/50 animate-ping" style={{ animationDuration: '700ms', animationIterationCount: 1 }}></span>}
        {copied ? (
          <>
            <Check className="w-5 h-5 animate-in zoom-in spin-in-12 duration-300" />
            <span className="animate-in fade-in slide-in-from-bottom-1">Copied to clipboard!</span>
          </>
        ) : (
          <>
            <Copy className="w-5 h-5" />
            <span>Copy prompt</span>
          </>
        )}
      </button>
    )
  }

  return (
    <button
      id={`btn-copy-${id}`}
      onClick={handleCopy}
      className={`relative flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full shadow-sm transition-all duration-300 border ${
        copied
          ? 'bg-rose-500 border-rose-500 text-white shadow-rose-500/25 scale-95'
          : 'bg-white border-gray-200 hover:bg-gray-50 text-black'
      }`}
    >
      {copied && <span className="absolute inset-0 rounded-full ring-4 ring-rose-500/40 animate-ping" style={{ animationDuration: '700ms', animationIterationCount: 1 }}></span>}
      {copied ? (
        <>
          <Check className="w-4 h-4 animate-in zoom-in spin-in-12 duration-300" />
          <span className="animate-in fade-in slide-in-from-bottom-1">Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>Copy</span>
        </>
      )}
    </button>
  )
}
