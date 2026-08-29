import Image from 'next/image'
import Link from 'next/link'
import { Eye, Copy } from 'lucide-react'
import SaveButton from './SaveButton'
import CardMenuDropdown from './CardMenuDropdown'
import TrendingBadge from './TrendingBadge'
import type { PromptCard } from '@/types/prompt'

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return String(n)
}

export default function MasonryGrid({ prompts, savedIds = [], isLoggedIn = false }: {
  prompts: PromptCard[]
  savedIds?: string[]
  isLoggedIn?: boolean
}) {
  if (!prompts || prompts.length === 0) {
    return (
      <div id="empty-state" className="empty-state py-24 flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">No prompts yet</h3>
        <p className="text-sm text-gray-500 font-medium max-w-[280px]">Discover beautifully curated AI prompts on the Explore page.</p>
      </div>
    )
  }

  return (
    <div id="masonry-grid" className="masonry-grid columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 px-4 md:px-8 space-y-4 w-full">
      {prompts.map((p, index) => (
        <div key={p.id} id={`card-${p.id}`} className="prompt-card break-inside-avoid relative group cursor-zoom-in">
          <Link href={`/prompts/${p.slug}`} className="prompt-card-link block">
            <div className="prompt-card-image relative rounded-[16px] overflow-hidden bg-gray-100">
              <div className="prompt-card-overlay absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" />

              <Image
                src={p.image_url}
                alt={p.title}
                width={500}
                height={700}
                className="prompt-card-img w-full h-auto object-cover"
                priority={index < 4}
              />

              {isLoggedIn && (
                <div className="prompt-card-save absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <SaveButton promptId={p.id} initialSaved={savedIds.includes(p.id)} variant="card" />
                </div>
              )}

              {p.is_premium && (
                <div className="absolute top-3 left-3 z-20 px-2.5 py-1 bg-black/70 backdrop-blur-md rounded-full text-white text-xs font-bold border border-white/10 shadow-sm flex items-center gap-1">
                  👑 Prime
                </div>
              )}

              {p.trending_score && p.trending_score > 0 && (
                <div className={`absolute z-20 ${p.is_premium ? 'top-12 left-3' : 'top-3 left-3'}`}>
                  <TrendingBadge score={p.trending_score} />
                </div>
              )}

              {/* Metrics overlay — bottom-left, visible on hover */}
              {((p.view_count ?? 0) > 0 || (p.copy_count ?? 0) > 0) && (
                <div className="prompt-card-metrics absolute bottom-3 left-3 z-20 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {(p.view_count ?? 0) > 0 && (
                    <span className="flex items-center gap-1 text-white/90 text-xs font-semibold drop-shadow-md">
                      <Eye className="w-3.5 h-3.5" />
                      {fmt(p.view_count!)}
                    </span>
                  )}
                  {(p.copy_count ?? 0) > 0 && (
                    <span className="flex items-center gap-1 text-white/90 text-xs font-semibold drop-shadow-md">
                      <Copy className="w-3.5 h-3.5" />
                      {fmt(p.copy_count!)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Link>

          <div className="prompt-card-footer mt-2 flex items-start justify-between px-1">
            <p className="prompt-card-title text-sm font-semibold truncate text-black pr-2">{p.title}</p>
            <CardMenuDropdown slug={p.slug} imageUrl={p.image_url} />
          </div>
        </div>
      ))}
    </div>
  )
}


