'use client'

import { useState } from 'react'
import CopyButton from '@/components/ui/CopyButton'
import SaveButton from '@/components/ui/SaveButton'
import LikeButton from '@/components/ui/LikeButton'
import ShareDropdown from '@/components/ui/ShareDropdown'
import ViewTracker from '@/components/prompt/ViewTracker'
import ExpandableImage from '@/components/prompt/ExpandableImage'
import MoreOptionsDropdown from '@/components/prompt/MoreOptionsDropdown'
import { Check } from 'lucide-react'

export default function PromptInteractiveViewer({ 
  prompt, 
  isSaved, 
  isLiked 
}: { 
  prompt: any, 
  isSaved: boolean, 
  isLiked: boolean 
}) {
  const variantType = prompt.variant_type || (prompt.has_variants ? 'gender' : 'standard')
  const hasVariants = variantType !== 'standard' && Array.isArray(prompt.variants) && prompt.variants.length > 0

  const [activeIndex, setActiveIndex] = useState(0)

  let activePromptText = prompt.prompt
  let activeImageUrl = prompt.image_url

  if (hasVariants && prompt.variants[activeIndex]) {
    activePromptText = prompt.variants[activeIndex].prompt
    activeImageUrl = prompt.variants[activeIndex].image_url
  }

  return (
    <div id={`prompt-detail-${prompt.id}`} className="prompt-detail-wrapper flex flex-col md:flex-row bg-white rounded-[32px] overflow-hidden min-h-[75vh] w-full text-black shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] relative">
      <ViewTracker id={prompt.id} />
      
      {/* Left: Image Side */}
      <div id="prompt-detail-image-side" className="prompt-detail-image-side md:w-1/2 p-4 md:p-5 flex">
        <ExpandableImage 
          src={activeImageUrl} 
          alt={prompt.title} 
          actionButtons={
            <div className="flex items-center gap-3">
              <div className="bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors">
                <ShareDropdown promptUrl={`/prompts/${prompt.slug}`} />
              </div>
              <div className="shadow-lg rounded-full">
                <SaveButton promptId={prompt.id} initialSaved={isSaved} variant="detail" />
              </div>
            </div>
          }
        />
      </div>

      {/* Right: Info Side */}
      <div id="prompt-detail-info-side" className="prompt-detail-info-side md:w-1/2 p-6 md:p-8 lg:px-10 lg:py-8 flex flex-col md:max-h-[85vh] md:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        {/* Top Header Actions */}
        <div id="prompt-detail-top-actions" className="prompt-detail-top-actions flex items-center justify-between mb-8 sticky top-0 bg-white/95 backdrop-blur-sm py-2 z-10">
          <div className="flex items-center gap-1">
            <LikeButton promptId={prompt.id} initialLiked={isLiked} initialCount={prompt.like_count || 0} />
            <ShareDropdown promptUrl={`/prompts/${prompt.slug}`} />
            <MoreOptionsDropdown promptId={prompt.id} promptUrl={`/prompts/${prompt.slug}`} imageUrl={activeImageUrl} />
          </div>
          
          <div className="shrink-0 scale-110 origin-right">
            <SaveButton promptId={prompt.id} initialSaved={isSaved} variant="detail" />
          </div>
        </div>

        {/* Creator Info */}
        <div id="prompt-detail-creator" className="prompt-detail-creator flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 shadow-sm border border-gray-100 overflow-hidden relative">
            {prompt.profiles?.avatar_url ? (
              <img src={prompt.profiles.avatar_url} alt="Creator avatar" className="w-full h-full object-cover" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-full h-full text-gray-400 bg-gray-100" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">{prompt.profiles?.display_name || prompt.profiles?.username || 'Prompt Creator'}</p>
            <p className="text-xs text-gray-500">{prompt.view_count || 0} views</p>
          </div>
        </div>

        {/* Variant Swatches */}
        {hasVariants && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              {variantType === 'gender' ? 'Select Gender Variant' : 'Select Variant'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {prompt.variants.map((v: any, idx: number) => {
                const isActive = activeIndex === idx
                const label = variantType === 'gender'
                  ? (v.gender === 'male' ? 'Male' : 'Female')
                  : String(idx + 1)

                return (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`relative rounded-full text-sm font-bold transition-all ${
                      variantType === 'gender' ? 'px-6 py-2.5' : 'w-10 h-10 flex items-center justify-center'
                    } ${isActive ? 'bg-black text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {isActive && variantType === 'gender' && <Check className="w-4 h-4 inline-block mr-1.5 -ml-1" />}
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Details Section */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-black mb-3">Details</h3>
          <div className="flex flex-wrap gap-2 text-sm">
            {prompt.category && (
              <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full font-semibold">{prompt.category.name}</span>
            )}
            {prompt.source_name && (
              <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-semibold">Tool: {prompt.source_name}</span>
            )}
            {prompt.model && (
              <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full font-semibold">Model: {prompt.model}</span>
            )}
            {prompt.style && (
              <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full font-semibold">Style: {prompt.style}</span>
            )}
            {prompt.aspect_ratio && (
              <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full font-semibold">AR: {prompt.aspect_ratio}</span>
            )}
          </div>
        </div>

        {/* Prompt Actions & Description */}
        <div className="mb-8 w-full" id="prompt-detail-copy-action">
          <CopyButton text={activePromptText || ''} id={prompt.id} variant="massive" />
        </div>

        {/* Description Section */}
        <div id="prompt-detail-content" className="prompt-detail-content pb-4 md:pb-0">
          <h1 className="text-xl font-bold text-black mb-3 leading-tight">{prompt.title}</h1>
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px] font-medium">
            <span className="mr-2" role="img" aria-label="pin">&#128204;</span>
            {activePromptText}
          </div>
        </div>

      </div>
    </div>
  )
}

