'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { submitFeedback } from '@/lib/user-actions'

export default function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
        <MessageCircle className="w-6 h-6" strokeWidth={2.5} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-black mb-2">Send Feedback</h2>
            <p className="text-sm text-gray-500 mb-6">Found a bug or have a feature request? Let us know!</p>
            
            {status === 'success' ? (
              <div className="p-4 bg-green-50 text-green-700 rounded-2xl text-sm font-semibold text-center">
                Thanks for your feedback!
              </div>
            ) : (
              <form action={async (formData) => {
                setStatus('loading')
                const res = await submitFeedback(formData)
                if (res?.error) setStatus('error')
                else setStatus('success')
              }} className="space-y-4">
                <textarea
                  name="message" required
                  rows={4}
                  placeholder="What's on your mind?"
                  className="w-full p-4 border border-gray-200/80 rounded-2xl bg-gray-50/50 focus:bg-white focus:outline-none focus:border-black transition-all text-sm font-medium text-gray-900 resize-none"
                />
                {status === 'error' && <p className="text-red-600 text-xs font-semibold">Failed to send feedback.</p>}
                <button disabled={status === 'loading'} className="w-full py-3.5 bg-black text-white rounded-2xl text-sm font-bold hover:bg-gray-800 transition-colors">
                  {status === 'loading' ? 'Sending...' : 'Submit'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
