'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Sparkles } from 'lucide-react'

const CARDS = [
  {
    id: 'automotive',
    src: '/homepage/content-area/content-area-1.png',
    alt: 'Dodge Challenger SRT Demon with neon lighting',
    tags: [
      { text: 'Neon rim lighting' },
      { text: 'Photorealistic render' },
    ],
  },
  {
    id: 'product',
    src: '/homepage/content-area/content-area-2.png',
    alt: 'Minimalist fabric smart speaker studio shot',
    tags: [
      { text: 'Studio product shot' },
      { text: 'Tactile fabric texture' },
    ],
  },
]

export default function InteractiveContentCards() {
  const [frontIndex, setFrontIndex] = useState(0)

  // Premium physics configuration
  const springConfig = {
    type: 'spring' as const,
    stiffness: 260,
    damping: 26,
    mass: 0.9,
  }

  return (
    <>
      {/* ─── CARDS CONTAINER ─── */}
      <div className="relative w-full h-full">
        {CARDS.map((card, idx) => {
          const isFront = idx === frontIndex
          
          return (
            <motion.div
              key={card.id}
              onClick={() => {
                if (!isFront) setFrontIndex(idx)
              }}
              // Animate between front and back spatial slots
              animate={{
                top: isFront ? '5rem' : '1rem',
                bottom: isFront ? '1rem' : '4rem',
                left: isFront ? '6rem' : '1rem',
                right: isFront ? '1rem' : '4rem',
                rotate: isFront ? 3 : -2.5,
                scale: isFront ? 1 : 0.94,
                zIndex: isFront ? 20 : 10,
                filter: isFront ? 'brightness(1)' : 'brightness(0.95)'
              }}
              initial={false}
              transition={springConfig}
              whileHover={
                !isFront 
                  ? { rotate: -4, x: -4, y: -4, scale: 0.95 } 
                  : { y: -4 }
              }
              className={`absolute rounded-[24px] overflow-hidden shadow-2xl ${
                !isFront ? 'cursor-pointer' : ''
              }`}
            >
              <Image
                src={card.src}
                alt={card.alt}
                fill
                className="object-cover select-none pointer-events-none"
              />
            </motion.div>
          )
        })}
      </div>

      {/* ─── FLOATING UI TAGS ─── */}
      <motion.div 
        layout
        className="absolute top-12 left-8 md:left-12 bg-white shadow-xl rounded-full px-5 py-3 flex items-center gap-3 z-30 overflow-hidden"
      >
        <Search className="w-4 h-4 text-black shrink-0" strokeWidth={3} />
        <AnimatePresence mode="wait">
          <motion.span
            key={CARDS[frontIndex].tags[0].text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-black font-bold text-sm whitespace-nowrap"
          >
            {CARDS[frontIndex].tags[0].text}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      <motion.div 
        layout
        className="absolute bottom-16 right-8 md:right-12 bg-white shadow-xl rounded-full px-5 py-3 flex items-center gap-3 z-30 overflow-hidden"
      >
        <Sparkles className="w-4 h-4 text-[#E60023] shrink-0" fill="currentColor" />
        <AnimatePresence mode="wait">
          <motion.span
            key={CARDS[frontIndex].tags[1].text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="text-black font-bold text-sm whitespace-nowrap"
          >
            {CARDS[frontIndex].tags[1].text}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </>
  )
}
