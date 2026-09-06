'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'

export default function FirstPromptModal({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const key = `mira_first_prompt_seen_${userId}`

  useEffect(() => {
    // URL override for testing
    const params = new URLSearchParams(window.location.search)
    if (params.get('welcome') === 'true' || params.get('onboarding') === 'true') {
      setOpen(true)
      return
    }
    // First-time only
    if (!localStorage.getItem(key)) {
      setOpen(true)
    }
  }, [key])

  const dismiss = () => {
    setOpen(false)
    localStorage.setItem(key, 'true')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={dismiss}
          onKeyDown={(e) => e.key === 'Escape' && dismiss()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-[90vw] md:w-[68vw] lg:w-[60vw] max-w-[840px] max-h-[90vh] overflow-y-auto bg-white rounded-[32px] shadow-2xl shadow-black/40 border border-black/[0.08]"
          >
            {/* Close */}
            <button
              onClick={dismiss}
              className="absolute top-5 right-5 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Hero Image */}
            <div className="relative w-[100%] h-[calc(var(--spacing)*100)] overflow-hidden">
              <Image
                src="/popup/popup-image.png"
                alt="Create your first prompt"
                fill
                priority
                className="object-cover object-[center_35%]"
              />
            </div>

            {/* Content */}
            <div className="px-8 md:px-12 pt-8 pb-10 text-center">
              <h2 className="text-3xl md:text-4xl font-black text-black tracking-tight leading-tight">
                Create Your First Prompt
              </h2>
              <p className="text-gray-500 mt-4 max-w-md mx-auto leading-relaxed">
                Turn your imagination into visual intelligence. Share your unique prompt, model parameters, and high-res results to inspire creators worldwide.
              </p>

              {/* Micro Guide */}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                {['1. Paste Prompt', '2. Upload Visual', '3. Inspire Creators'].map(step => (
                  <span key={step} className="text-xs font-bold text-black bg-gray-100 px-4 py-2 rounded-full">
                    {step}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <Link
                href="/submit-prompt"
                onClick={dismiss}
                className="inline-block mt-8 bg-[#E60023] text-white font-bold text-lg px-10 py-4 rounded-full hover:bg-red-600 hover:scale-105 active:scale-95 transition-all shadow-lg"
              >
                Create Your First Prompt →
              </Link>

              {/* Dismiss */}
              <button
                onClick={dismiss}
                className="block mx-auto mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Explore library first
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
