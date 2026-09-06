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
            className="relative w-[92vw] md:w-[68vw] lg:w-[56vw] max-w-[760px] max-h-[92vh] overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-white rounded-[28px] md:rounded-[32px] shadow-2xl shadow-black/40 border border-black/[0.08]"
          >
            {/* Close */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Hero Image */}
            <div className="relative w-[100%] h-36 sm:h-48 md:h-60 lg:h-72 max-h-[36vh] overflow-hidden">
              <Image
                src="/popup/popup-image.png"
                alt="Create your first prompt"
                fill
                priority
                className="object-cover object-[center_35%]"
              />
            </div>

            {/* Content */}
            <div className="px-5 sm:px-8 md:px-10 pt-4 md:pt-5 pb-5 md:pb-6 text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-black tracking-tight leading-tight">
                Create Your First Prompt
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-lg mx-auto leading-relaxed">
                Turn your imagination into visual intelligence. Share your unique prompt, model parameters, and high-res results to inspire creators worldwide.
              </p>

              {/* Micro Guide */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3 md:mt-4">
                {['1. Paste Prompt', '2. Upload Visual', '3. Inspire Creators'].map(step => (
                  <span key={step} className="text-[11px] sm:text-xs font-semibold text-black bg-gray-100 px-3 py-1.5 rounded-full">
                    {step}
                  </span>
                ))}
              </div>

              {/* Action Buttons (Beside Each Other) */}
              <div className="flex flex-row items-center justify-center gap-3 sm:gap-4 mt-4 md:mt-5">
                <Link
                  href="/submit-prompt"
                  onClick={dismiss}
                  className="bg-[#E60023] hover:bg-red-600 text-white font-bold text-xs sm:text-sm md:text-base px-5 sm:px-7 py-2.5 sm:py-3 rounded-full hover:scale-105 active:scale-95 transition-all shadow-md whitespace-nowrap"
                >
                  Create Your First Prompt →
                </Link>

                <button
                  onClick={dismiss}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm md:text-base font-semibold text-gray-600 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-full transition-colors whitespace-nowrap"
                >
                  Explore Library First
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
