'use client'

import { useState } from 'react'
import { createPrompt, updatePrompt } from '@/lib/admin-actions'

const convertToWebP = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new globalThis.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject('No canvas context')
        ctx.drawImage(img, 0, 0)
        canvas.toBlob((blob) => {
          if (!blob) return reject('Blob creation failed')
          const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp"
          const newFile = new File([blob], newFileName, { type: 'image/webp' })
          resolve(newFile)
        }, 'image/webp', 0.85) // 85% quality compression
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function PromptForm({ 
  categories, 
  initialData 
}: { 
  categories: { id: string; name: string }[]
  initialData?: any 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const action = initialData ? updatePrompt.bind(null, initialData.id) : createPrompt

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.currentTarget)
      const imageFile = formData.get('image') as File
      
      // Convert to WebP if it's a valid image and not already webp
      if (imageFile && imageFile.size > 0 && !imageFile.type.includes('webp')) {
        const webpFile = await convertToWebP(imageFile)
        formData.set('image', webpFile)
      }
      
      await action(formData)
    } catch (err: any) {
      if (err?.message?.includes('NEXT_REDIRECT') || err?.digest?.includes('NEXT_REDIRECT')) {
        throw err;
      }
      console.error(err)
      alert("Failed to submit. Check console for details.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div id="prompt-form-container" className="prompt-form-container bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
      <form id="form-prompt-create" onSubmit={handleSubmit} className="form-prompt-create space-y-6 max-w-3xl">
        
        {/* Title */}
        <fieldset id="field-title" className="field-title space-y-2">
          <label htmlFor="input-title" className="block text-sm font-semibold text-gray-700">Title <span className="text-red-500">*</span></label>
          <input
            id="input-title"
            name="title"
            required
            defaultValue={initialData?.title}
            placeholder="e.g. Cinematic Rain Portrait"
            className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-medium"
          />
        </fieldset>

        {/* Image */}
        <fieldset id="field-image" className="field-image space-y-2">
          <label htmlFor="input-image" className="block text-sm font-semibold text-gray-700">Image {initialData ? '(Optional)' : '<span className="text-red-500">*</span>'}</label>
          <input
            id="input-image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            required={!initialData}
            className="w-full text-sm text-gray-500 file:mr-4 file:px-5 file:py-3 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200 cursor-pointer"
          />
          {initialData?.image_url && <p className="text-xs text-gray-400 mt-2">Current image will be kept if you do not upload a new one.</p>}
        </fieldset>

        {/* Prompt Body */}
        <fieldset id="field-prompt" className="field-prompt space-y-2">
          <label htmlFor="input-prompt" className="block text-sm font-semibold text-gray-700">Prompt Text <span className="text-red-500">*</span></label>
          <textarea
            id="input-prompt"
            name="prompt"
            required
            defaultValue={initialData?.prompt}
            rows={5}
            placeholder="A cinematic portrait of a woman standing in the rain, 8k resolution, photorealistic..."
            className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-medium resize-y leading-relaxed"
          />
        </fieldset>

        {/* Row: Category + Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <fieldset id="field-category" className="field-category space-y-2">
            <label htmlFor="select-category" className="block text-sm font-semibold text-gray-700">Category</label>
            <select
              id="select-category"
              name="category_id"
              defaultValue={initialData?.category_id || ""}
              className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-medium appearance-none"
            >
              <option value="">None</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </fieldset>
          
          <fieldset id="field-tags" className="field-tags space-y-2">
            <label htmlFor="input-tags" className="block text-sm font-semibold text-gray-700">Tags</label>
            <input
              id="input-tags"
              name="tags"
              defaultValue={initialData?.tags?.map((t: any) => t.tag.name).join(', ')}
              placeholder="cinematic, portrait, rain (comma separated)"
              className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-medium"
            />
          </fieldset>
        </div>

        {/* Row: Model + Aspect Ratio + Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <fieldset id="field-model" className="field-model space-y-2">
            <label htmlFor="input-model" className="block text-sm font-semibold text-gray-700">Model</label>
            <input
              id="input-model"
              name="model"
              defaultValue={initialData?.model}
              placeholder="Midjourney v6, Flux..."
              className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-medium"
            />
          </fieldset>
          <fieldset id="field-ar" className="field-ar space-y-2">
            <label htmlFor="input-ar" className="block text-sm font-semibold text-gray-700">Aspect Ratio</label>
            <input
              id="input-ar"
              name="aspect_ratio"
              defaultValue={initialData?.aspect_ratio}
              placeholder="16:9, 4:5..."
              className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-medium"
            />
          </fieldset>
          <fieldset id="field-style" className="field-style space-y-2">
            <label htmlFor="input-style" className="block text-sm font-semibold text-gray-700">Style</label>
            <input
              id="input-style"
              name="style"
              defaultValue={initialData?.style}
              placeholder="Editorial, Fantasy..."
              className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-medium"
            />
          </fieldset>
        </div>

        {/* Row: Source Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-[24px] border border-gray-100">
          <fieldset id="field-source-name" className="field-source-name space-y-2">
            <label htmlFor="input-source-name" className="block text-sm font-semibold text-gray-700">Creator Name</label>
            <input 
              id="input-source-name"
              name="source_name" 
              defaultValue={initialData?.source_name}
              placeholder="Who made this?" 
              className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-white focus:outline-none focus:border-black transition-all text-sm font-medium" 
            />
          </fieldset>
          <fieldset id="field-source-url" className="field-source-url space-y-2">
            <label htmlFor="input-source-url" className="block text-sm font-semibold text-gray-700">Creator URL</label>
            <input 
              id="input-source-url"
              name="source_url" 
              type="url" 
              defaultValue={initialData?.source_url}
              placeholder="https://..." 
              className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-white focus:outline-none focus:border-black transition-all text-sm font-medium" 
            />
          </fieldset>
        </div>

        {/* Status + Featured */}
        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-100">
          <fieldset id="field-status" className="field-status flex items-center gap-3">
            <label htmlFor="select-status" className="text-sm font-semibold text-gray-700">Visibility</label>
            <select
              id="select-status"
              name="status"
              defaultValue={initialData?.status || "draft"}
              className="px-5 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-bold"
            >
              <option value="draft">Draft (Hidden)</option>
              <option value="published">Published (Public)</option>
            </select>
          </fieldset>
          
          <label id="label-featured" className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input id="input-featured" name="is_featured" type="checkbox" defaultChecked={initialData?.is_featured} className="peer w-6 h-6 appearance-none border-2 border-gray-200 rounded-lg checked:bg-black checked:border-black transition-colors cursor-pointer" />
              <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none">
                <path d="M1.5 5.5L5 9L12.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-black transition-colors">Mark as Featured</span>
          </label>

          <label id="label-premium" className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input id="input-premium" name="is_premium" type="checkbox" defaultChecked={initialData?.is_premium} className="peer w-6 h-6 appearance-none border-2 border-gray-200 rounded-lg checked:bg-black checked:border-black transition-colors cursor-pointer" />
              <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none">
                <path d="M1.5 5.5L5 9L12.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-black transition-colors flex items-center gap-1">👑 Prime Only</span>
          </label>
        </div>

        {/* Submit */}
        <div className="pt-6">
          <button
            id="btn-prompt-submit"
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-10 py-4 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 disabled:opacity-70 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
          >
            {isSubmitting ? 'Uploading...' : (initialData ? 'Update Prompt' : 'Create Prompt')}
          </button>
        </div>
      </form>
    </div>
  )
}
