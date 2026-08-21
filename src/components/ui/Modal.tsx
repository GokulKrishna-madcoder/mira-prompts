'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Modal({ children }: { children: React.ReactNode }) {
  const overlay = useRef<HTMLDivElement>(null)
  const wrapper = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const onDismiss = useCallback(() => {
    router.back()
  }, [router])

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlay.current || e.target === wrapper.current) {
        if (onDismiss) onDismiss()
      }
    },
    [onDismiss, overlay, wrapper]
  )

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss()
    },
    [onDismiss]
  )

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [onKeyDown])

  return (
    <div
      id="modal-overlay"
      ref={overlay}
      className="modal-overlay fixed inset-0 z-50 bg-black/60 p-4 pb-28 sm:p-10 flex justify-center items-center overflow-y-auto backdrop-blur-sm [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      onClick={onClick}
    >
      <button
        id="btn-modal-close"
        onClick={onDismiss}
        className="btn-modal-close fixed top-6 left-6 z-[60] w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur transition-colors shadow-lg"
      >
        <X className="w-6 h-6" />
      </button>

      <div
        id="modal-content-wrapper"
        ref={wrapper}
        className="modal-content-wrapper relative w-full max-w-[1080px] m-auto mt-10 md:mt-auto bg-transparent rounded-[32px] overflow-hidden"
      >
        {children}
      </div>
    </div>
  )
}
