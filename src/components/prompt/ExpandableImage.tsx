'use client'

import { useState, useEffect } from 'react'
import { Maximize2, X } from 'lucide-react'
import { createPortal } from 'react-dom'

export default function ExpandableImage({ src, alt, actionButtons }: { src: string; alt: string; actionButtons?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Ensure portal only renders on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Fullscreen lightbox portal
  const lightbox = mounted && isOpen ? createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-200"
      onClick={() => setIsOpen(false)}
    >
      <button 
        onClick={() => setIsOpen(false)}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 p-3 text-black bg-white/90 hover:bg-white rounded-2xl shadow-lg transition-transform hover:scale-105 z-10"
      >
        <X className="w-6 h-6" strokeWidth={2.5} />
      </button>

      {/* Top-Right Action Buttons (Save/Share) */}
      {actionButtons && (
        <div 
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {actionButtons}
        </div>
      )}
      
      <img
        src={src}
        alt={alt}
        className="max-w-[95vw] max-h-[90vh] w-auto h-auto object-contain rounded-[24px] md:rounded-[32px] shadow-[0_40px_80px_rgba(0,0,0,0.5)] select-none animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
      />
    </div>,
    document.body
  ) : null

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="relative w-full h-auto md:h-full md:min-h-[400px] bg-gray-50 rounded-[32px] overflow-hidden shadow-inner flex items-center justify-center group cursor-pointer"
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-auto md:absolute md:inset-0 md:h-full md:object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Darken overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />
        
        {/* Always visible Maximize Icon (Bottom Right) */}
        <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md p-2.5 rounded-full text-white shadow-lg border border-white/20 group-hover:bg-black/60 group-hover:scale-110 transition-all duration-300 pointer-events-none">
          <Maximize2 className="w-5 h-5" />
        </div>
      </div>
      
      {lightbox}
    </>
  )
}

