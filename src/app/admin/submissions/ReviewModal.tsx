'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { X, Tag, Cpu, Layout, Type } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import { useEffect, useState } from 'react'

export default function ReviewModal({ prompts, approveAction, rejectAction }: { prompts: any[], approveAction: (id: string) => Promise<void>, rejectAction: (id: string) => Promise<void> }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reviewId = searchParams.get('review')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const prompt = prompts.find(p => p.id === reviewId)

  useEffect(() => {
    if (reviewId && !prompt) {
      router.replace('/admin/submissions')
    }
  }, [reviewId, prompt, router])

  if (!reviewId || !prompt) return null

  const closeModal = () => router.push('/admin/submissions')

  const handleAction = async (type: 'approve' | 'reject') => {
    setIsSubmitting(true)
    try {
      if (type === 'approve') await approveAction(prompt.id)
      else await rejectAction(prompt.id)
      closeModal()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal>
      <div className="bg-white rounded-3xl w-full max-w-4xl mx-auto flex flex-col max-h-[90vh] overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Review Submission</h2>
          <button onClick={closeModal} className="p-2 text-gray-400 hover:text-black rounded-full transition-colors bg-gray-50 hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Left: Image */}
            <div className="md:w-1/2 space-y-4 shrink-0">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                <Image src={prompt.image_url} alt={prompt.title} fill className="object-cover" unoptimized />
              </div>

              {/* Variants Grid */}
              {prompt.has_variants && prompt.variants && prompt.variants.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-gray-900">Variants</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {prompt.variants.map((v: any, idx: number) => (
                      <div key={idx} className="space-y-2">
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                          {v.image_url && <Image src={v.image_url} alt="Variant" fill className="object-cover" unoptimized />}
                        </div>
                        <p className="text-xs font-medium text-gray-600 line-clamp-2" title={v.prompt}>{v.prompt}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Details */}
            <div className="md:w-1/2 space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{prompt.title}</h1>
                <p className="text-sm font-medium text-gray-500 mt-1">
                  By {prompt.profiles?.display_name || prompt.profiles?.username || 'Unknown'} • {new Date(prompt.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Metadata Chips */}
              <div className="flex flex-wrap gap-2">
                {prompt.category?.name && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold border border-gray-100">
                    <Layout className="w-3.5 h-3.5 text-gray-400" /> {prompt.category.name}
                  </span>
                )}
                {prompt.source_name && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold border border-gray-100">
                    <Cpu className="w-3.5 h-3.5 text-gray-400" /> {prompt.source_name}
                  </span>
                )}
                {prompt.aspect_ratio && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold border border-gray-100">
                    <Layout className="w-3.5 h-3.5 text-gray-400" /> {prompt.aspect_ratio}
                  </span>
                )}
                {prompt.style && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold border border-gray-100">
                    <Type className="w-3.5 h-3.5 text-gray-400" /> {prompt.style}
                  </span>
                )}
              </div>

              {/* Prompt Text */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-gray-900">Main Prompt</h3>
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-sm text-gray-700 leading-relaxed max-h-64 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {prompt.prompt}
                </div>
              </div>

              {/* Tags */}
              {prompt.tags && prompt.tags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-gray-900">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {prompt.tags.map((t: any, idx: number) => (
                      <span key={idx} className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 rounded-md text-xs font-medium border border-gray-100">
                        <Tag className="w-3 h-3 text-gray-400" /> {t.tag?.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button 
            disabled={isSubmitting}
            onClick={() => handleAction('reject')}
            className="px-6 py-2.5 text-sm font-bold text-red-500 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Reject & Return to Drafts'}
          </button>
          <button 
            disabled={isSubmitting}
            onClick={() => handleAction('approve')}
            className="px-6 py-2.5 text-sm font-bold text-white bg-green-500 rounded-xl hover:bg-green-600 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Approve & Publish'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
