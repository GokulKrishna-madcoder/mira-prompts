'use client'

import { useState, useRef, useCallback } from 'react'
import { createPrompt, updatePrompt } from '@/lib/admin-actions'
import { Plus, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react'

const AI_TOOLS = ['ChatGPT', 'Claude', 'Gemini', 'Grok', 'Midjourney', 'DALL-E', 'Stable Diffusion', 'Lovable']

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
          resolve(new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.webp', { type: 'image/webp' }))
        }, 'image/webp', 0.85)
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

type VariantType = 'standard' | 'gender' | 'creative_ads'

export default function PromptForm({ categories, initialData }: { categories: { id: string; name: string }[], initialData?: any }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [variantType, setVariantType] = useState<VariantType>(initialData?.variant_type || 'standard')
  const [adVariants, setAdVariants] = useState(
    initialData?.variant_type === 'creative_ads' && initialData?.variants?.length > 0
      ? initialData.variants.map((v: any) => ({ prompt: v.prompt }))
      : [{ prompt: '' }, { prompt: '' }]
  )
    const [selectedTools, setSelectedTools] = useState<string[]>(
    initialData?.ai_tool && AI_TOOLS.includes(initialData.ai_tool) ? [initialData.ai_tool] : []
  )
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image_url || null)
  const [titleLen, setTitleLen] = useState(initialData?.title?.length || 0)
  const [showNewCategory, setShowNewCategory] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024) {
      setPreviewUrl(URL.createObjectURL(file))
      if (fileInputRef.current) {
        const dt = new DataTransfer()
        dt.items.add(file)
        fileInputRef.current.files = dt.files
      }
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPreviewUrl(URL.createObjectURL(file))
  }

  const addTag = (value: string) => {
    const newTags = value.split(',').map(t => t.trim()).filter(t => t && !tags.includes(t))
    if (tags.length + newTags.length <= 5) {
      setTags([...tags, ...newTags])
    }
    setTagInput('')
  }

  const toggleTool = (tool: string) => {
    if (selectedTools.includes(tool)) {
      setSelectedTools(selectedTools.filter(t => t !== tool))
    } else if (selectedTools.length < 3) {
      setSelectedTools([...selectedTools, tool])
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, action: 'draft' | 'publish') => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.currentTarget)

      // Convert images to WebP
      const imageFields = ['image', 'image_male', 'image_female']
      for (let i = 1; i <= 10; i++) imageFields.push(`image_ad_${i}`)
      for (const field of imageFields) {
        const file = formData.get(field) as File
        if (file && file.size > 0 && !file.type.includes('webp')) {
          const webp = await convertToWebP(file)
          formData.set(field, webp)
        }
      }

      formData.set('action', action)
      formData.set('variant_type', variantType)
      formData.set('has_variants', variantType !== 'standard' ? 'true' : 'false')
      formData.set('tags', tags.join(','))
      formData.set('ai_tool', selectedTools[0] || '')
      if (variantType === 'creative_ads') {
        formData.set('ad_variant_count', String(adVariants.length))
      }

      if (initialData?.id) {
        await updatePrompt(initialData.id, formData)
      } else {
        await createPrompt(formData)
      }
      window.location.href = '/admin/prompts'
    } catch (err: any) {
      alert(err.message || 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const radioClass = (active: boolean) =>
    `px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all border-2 ${active ? 'bg-black text-white border-black' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400'}`

  return (
    <form onSubmit={(e) => handleSubmit(e, 'publish')} className="flex flex-col lg:flex-row gap-8">
      {/* â”€â”€ LEFT: Image Upload â”€â”€ */}
      <div className="lg:w-[45%] shrink-0">
        <div
          ref={dropRef}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="relative aspect-[4/3] w-full rounded-[24px] border-2 border-dashed border-gray-300 hover:border-black bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden group"
        >
          {previewUrl ? (
            <>
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setPreviewUrl(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="text-center p-8">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3 group-hover:text-black transition-colors" />
              <p className="text-sm font-semibold text-gray-600">Drag & drop your cover image</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP up to 5MB</p>
            </div>
          )}
          <input ref={fileInputRef} name="image" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </div>
      </div>

      {/* â”€â”€ RIGHT: Form Fields â”€â”€ */}
      <div className="flex-1 space-y-6">
        {/* Title */}
        <fieldset className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-gray-700">Title <span className="text-red-500">*</span></label>
            <span className={`text-xs font-medium ${titleLen > 80 ? 'text-red-500' : 'text-gray-400'}`}>{titleLen}/80</span>
          </div>
                    <input
            name="title"
            required
            maxLength={80}
            defaultValue={initialData?.title}
            onChange={(e) => setTitleLen(e.target.value.length)}
            placeholder="e.g. Cinematic Neon Portrait Generator"
            className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-medium"
          />
        </fieldset>

        {/* Prompt Format */}
        <div className="space-y-3 py-4 border-t border-b border-gray-100">
          <label className="text-sm font-semibold text-gray-700">Prompt Format</label>
          <div className="flex flex-wrap gap-2">
            {(['standard', 'gender', 'creative_ads'] as const).map(t => (
              <button key={t} type="button" onClick={() => setVariantType(t)} className={radioClass(variantType === t)}>
                {t === 'standard' ? 'Standard' : t === 'gender' ? 'Gender Variants' : 'Creative Ads'}
              </button>
            ))}
          </div>
        </div>

        {/* Standard Prompt */}
        {variantType === 'standard' && (
          <fieldset className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Prompt Text <span className="text-red-500">*</span></label>
                        <textarea name="prompt" defaultValue={initialData?.prompt} required rows={5} placeholder="Write your prompt here..." className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-medium resize-y leading-relaxed" />
          </fieldset>
        )}

        {/* Gender Variants */}
        {variantType === 'gender' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['Male', 'Female'].map(g => (
                                          <div key={g} className="space-y-4 p-5 bg-gray-50 border border-gray-100 rounded-[20px]">
                <h3 className="font-bold text-gray-900">{g} Variant</h3>
                <input name={`image_${g.toLowerCase()}`} type="file" accept="image/*" required={!initialData?.id} className="w-full text-sm text-gray-500 file:mr-4 file:px-4 file:py-2 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black cursor-pointer" />
                <textarea name={`prompt_${g.toLowerCase()}`} defaultValue={initialData?.variants?.find((v:any) => v.gender === g.toLowerCase())?.prompt} required rows={3} placeholder={`${g} prompt...`} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-black transition-all text-sm font-medium resize-y" />
              </div>
            ))}
          </div>
        )}

        {/* Creative Ads */}
        {variantType === 'creative_ads' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">{adVariants.length} of 10 variants</p>
              <button type="button" onClick={() => adVariants.length < 10 && setAdVariants([...adVariants, { prompt: '' }])} disabled={adVariants.length >= 10} className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-full bg-black text-white disabled:opacity-40 transition-colors">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adVariants.map((_: any, idx: number) => (
                <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-[18px] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center text-xs font-black">{idx + 1}</span>
                      <h4 className="font-bold text-gray-900 text-sm">Variant {idx + 1}</h4>
                    </div>
                    {adVariants.length > 2 && (
                      <button type="button" onClick={() => setAdVariants(adVariants.filter((_: any, i: number) => i !== idx))} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <input name={`image_ad_${idx + 1}`} type="file" accept="image/*" required={!initialData?.id || !initialData?.variants?.find((v:any) => v.id === idx + 1)?.image_url} className="w-full text-sm text-gray-500 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white cursor-pointer" />
                  <textarea name={`prompt_ad_${idx + 1}`} defaultValue={adVariants[idx].prompt} required rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-black transition-all text-sm font-medium resize-y" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category */}
        <fieldset className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">Category</label>
            <button type="button" onClick={() => setShowNewCategory(!showNewCategory)} className="text-xs font-bold text-black hover:underline">
              + Add Category
            </button>
          </div>
          {showNewCategory ? (
            <input name="new_category" placeholder="New category name" className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-medium" />
          ) : (
                        <select name="category_id" defaultValue={initialData?.category_id || ""} className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-medium appearance-none">
              <option value="">Select a category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
        </fieldset>

        {/* AI Tools */}
        <fieldset className="space-y-3">
          <label className="text-sm font-semibold text-gray-700">AI Tool <span className="text-xs text-gray-400 font-normal">(up to 3)</span></label>
          <div className="flex flex-wrap gap-2">
            {AI_TOOLS.map(tool => (
              <button
                key={tool}
                type="button"
                onClick={() => toggleTool(tool)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                  selectedTools.includes(tool)
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {selectedTools.indexOf(tool) === 0 && selectedTools.includes(tool) && <span className="mr-1 text-xs bg-white/20 px-1.5 py-0.5 rounded">1st</span>}
                {tool}
              </button>
            ))}
          </div>
          {selectedTools.length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                            <input name="custom_tool_name" defaultValue={!AI_TOOLS.includes(initialData?.ai_tool) ? initialData?.ai_tool : ''} placeholder="Custom tool name" className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white text-sm font-medium" />
              <input name="custom_tool_url" type="url" placeholder="Tool URL (optional)" className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white text-sm font-medium" />
            </div>
          )}
        </fieldset>

        {/* Style + Aspect Ratio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <fieldset className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Style</label>
                        <input name="style" defaultValue={initialData?.style} placeholder="e.g. Cinematic, Anime" className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-medium" />
          </fieldset>
          <fieldset className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Aspect Ratio</label>
                        <input name="aspect_ratio" defaultValue={initialData?.aspect_ratio} placeholder="e.g. 16:9, 1:1" className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-medium" />
          </fieldset>
        </div>

        {/* Tags */}
        <fieldset className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Tags <span className="text-red-500">*</span> <span className="text-xs text-gray-400 font-normal">(up to 5)</span></label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(t => (
              <span key={t} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                {t}
                <button type="button" onClick={() => setTags(tags.filter(x => x !== t))} className="text-gray-400 hover:text-red-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
          {tags.length < 5 && (
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
                  e.preventDefault()
                  addTag(tagInput)
                }
              }}
              placeholder="Type a tag and press Enter"
              className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-medium"
            />
          )}
        </fieldset>

        {/* Status + Featured + Premium */}
        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-100">
          <fieldset className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">Visibility</label>
            <select name="status" defaultValue={initialData?.status || 'draft'} className="px-5 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-bold">
              <option value="draft">Draft (Hidden)</option>
              <option value="published">Published (Public)</option>
            </select>
          </fieldset>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input type="checkbox" name="is_featured" defaultChecked={initialData?.is_featured} className="peer sr-only" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
            </div>
            <span className="text-sm font-bold text-gray-700 group-hover:text-black">Mark as Featured</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input type="checkbox" name="is_premium" defaultChecked={initialData?.is_premium} className="peer sr-only" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
            </div>
            <span className="text-sm font-bold text-gray-700 group-hover:text-black">Premium Only</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => {
              const form = (e.target as HTMLElement).closest('form')
              if (form) handleSubmit({ preventDefault: () => {}, currentTarget: form } as any, 'draft')
            }}
            className="px-8 py-3.5 border-2 border-gray-200 text-gray-700 rounded-full text-sm font-bold hover:border-black hover:text-black transition-all disabled:opacity-50"
          >
            Save Draft
          </button>
                    <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-8 py-4 bg-black text-white font-bold rounded-full hover:bg-gray-800 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (initialData?.id ? 'Updating...' : 'Submitting...') : (initialData?.id ? 'Update Prompt' : 'Submit for review')}
          </button>
        </div>
      </div>
    </form>
  )
}















