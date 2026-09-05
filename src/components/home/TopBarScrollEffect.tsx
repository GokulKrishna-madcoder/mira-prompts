'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useReducedMotion } from 'motion/react'

export default function TopBarScrollEffect() {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (pathname !== '/' || reduceMotion) return

    const nav = document.getElementById('landing-nav')
    const logo = nav?.querySelector('img[src*="miralandingpage"]') as HTMLImageElement | null
    const links = Array.from(nav?.querySelectorAll('a[href="/login"], a[href="/signup"], a[href="/about"]') || []) as HTMLAnchorElement[]
    
    if (!nav || !logo || links.length === 0) return

    const originalNavClass = nav.className
    const originalLogoFilter = logo.style.filter
    const originalLinkClasses = links.map(l => l.className)

    const setDarkTheme = () => {
      nav.classList.add('bg-transparent')
      nav.classList.remove('bg-white/80', 'backdrop-blur-xl', 'border-b', 'border-gray-100')
      logo.style.filter = 'brightness(0) invert(1)'
      links.forEach((l) => {
        l.classList.add('text-white', 'drop-shadow-md')
        l.classList.remove('text-gray-600', 'text-gray-700', 'hover:text-black', 'hover:bg-gray-100')
        if (l.href.includes('/signup')) {
          l.classList.remove('bg-red-500', 'hover:bg-red-600')
          l.classList.add('bg-red-500', 'hover:bg-red-600', 'text-white')
        }
      })
    }

    const setLightTheme = () => {
      nav.className = originalNavClass
      logo.style.filter = originalLogoFilter
      links.forEach((l, idx) => {
        l.className = originalLinkClasses[idx]
      })
    }

    setDarkTheme()

    const contentArea = document.getElementById('content-area')

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const theme = entry.target.getAttribute('data-theme')
          if (theme === 'dark') {
            setDarkTheme()
          } else {
            setLightTheme()
          }
        }
      })
    }, {
      root: contentArea,
      rootMargin: "-60px 0px -90% 0px",
      threshold: 0
    })

    const sections = document.querySelectorAll('section[data-theme]')
    sections.forEach(section => observer.observe(section))

    return () => {
      observer.disconnect()
      setLightTheme()
    }
  }, [pathname, reduceMotion])

  return null
}
