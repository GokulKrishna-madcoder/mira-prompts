'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function HoverSlideshow({ coverImage, variants, alt, priority }: {
  coverImage: string
  variants: any[]
  alt: string
  priority?: boolean
}) {
  // Deduplicate: cover image + any variants that are different
  const images = [
    coverImage, 
    ...variants.map(v => v.image_url).filter(url => url && url !== coverImage)
  ]
  
  const [idx, setIdx] = useState(0)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    if (!hover || images.length <= 1) { 
      setTimeout(() => setIdx(0), 0) // ponytail: defer to avoid setState in effect warning
      return 
    }
    const timer = setInterval(() => setIdx(i => (i + 1) % images.length), 1200)
    return () => clearInterval(timer)
  }, [hover, images.length])

  return (
    <div 
      className="relative w-full"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {images.map((img, i) => (
        <Image
          key={img}
          src={img}
          alt={alt}
          width={500}
          height={700}
          priority={priority && i === 0}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-500 ${
            i === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        />
      ))}
      
      {/* Invisible spacer image to maintain the DOM height/width naturally without JS measurement */}
      <Image
        src={images[0]}
        alt=""
        width={500}
        height={700}
        className="w-full h-auto invisible relative z-[-1]"
        priority={priority}
      />
    </div>
  )
}
