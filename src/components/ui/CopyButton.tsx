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
  }

  if (variant === 'massive') {
    return (
      <button
        id={`btn-copy-massive-${id}`}
        onClick={handleCopy}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 hover:bg-gray-200 text-black text-base font-bold rounded-[20px] transition-colors"
      >
        {copied ? 'Copied to clipboard!' : 'Copy prompt'}
      </button>
    )
  }

  return (
    <button
      id={`btn-copy-${id}`}
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-black text-sm font-semibold rounded-full shadow-sm transition-colors border border-gray-200"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
