'use client'

import { useState } from 'react'
import { createPrompt, updatePrompt } from '@/lib/admin-actions'
import { Plus, Trash2 } from 'lucide-react'

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

function getInitialVariantType(data: any): VariantType {
  if (!data) return 'standard'
  if (data.variant_type === 'creative_ads') return 'creative_ads'
  if (data.has_variants) return 'gender'
  return 'standard'
}

function getInitialAdVariants(data: any): { prompt: string }[] {
  if (data?.variant_type === 'creative_ads' && Array.isArray(data.variants)) {
    return data.variants.map((v: any) => ({ prompt: v.prompt || '' }))
  }
  return [{ prompt: '' }, { prompt: '' }]
}

export default function PromptForm({ 
  categories, 
  initialData 
}: { 
  categories: { id: string; name: string }[]
  initialData?: any 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [variantType, setVariantType] = useState<VariantType>(getInitialVariantType(initialData))
  const [adVariants, setAdVariants] = useState(getInitialAdVariants(initialData))
  const action = initialData ? updatePrompt.bind(null, initialData.id) : createPrompt

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formData = new FormData(e.currentTarget)
      
      // Convert all image fields to WebP
      const allImageFields: string[] = ['image', 'image_male', 'image_female']
      for (let i = 1; i <= 10; i++) allImageFields.push(`image_ad_${i}`)
      for (const field of allImageFields) {
        const file = formData.get(field) as File
        if (file && file.size > 0 && !file.type.includes('webp')) {
          const webpFile = await convertToWebP(file)
          formData.set(field, webpFile)
        }
      }
      
      formData.set('variant_type', variantType)
      formData.set('has_variants', variantType !== 'standard' ? 'true' : 'false')
      if (variantType === 'creative_ads') {
        formData.set('ad_variant_count', String(adVariants.length))
      }

      await action(formData)
    } catch (err: any) {
      if (err?.message?.includes('NEXT_REDIRECT') || err?.digest?.includes('NEXT_REDIRECT')) {
        throw err;
      }
      console.error(err)
      alert(err.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const maleVariant = initialData?.variants?.find((v: any) => v.gender === 'male')
  const femaleVariant = initialData?.variants?.find((v: any) => v.gender === 'female')

  const addAdVariant = () => {
    if (adVariants.length < 10) setAdVariants([...adVariants, { prompt: '' }])
  }
  const removeAdVariant = (idx: number) => {
    if (adVariants.length > 2) setAdVariants(adVariants.filter((_, i) => i !== idx))
  }

  const radioClass = (active: boolean) =>
    `px-5 py-3 rounded-2xl text-sm font-bold cursor-pointer transition-all border-2 ${active ? 'bg-black text-white border-black shadow-md' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400'}`

  return (
    <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title */}
        <fieldset className="space-y-2">
          <label htmlFor="input-title" className="block text-sm font-semibold text-gray-700">Title <span className="text-red-500">*</span></label>
          <input id="input-title" name="title" required defaultValue={initialData?.title} placeholder="e.g. Cinematic Neon Portrait" className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-medium" />
        </fieldset>

        {/* Prompt Format Selector */}
        <div className="pt-4 border-t border-b border-gray-100 py-6 space-y-3">
          <label className="block text-sm font-semibold text-gray-700">Prompt Format</label>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => setVariantType('standard')} className={radioClass(variantType === 'standard')}>
              Standard
            </button>
            <button type="button" onClick={() => setVariantType('gender')} className={radioClass(variantType === 'gender')}>
              Gender Variants
            </button>
            <button type="button" onClick={() => setVariantType('creative_ads')} className={radioClass(variantType === 'creative_ads')}>
              Creative Ads
            </button>
          </div>
        </div>

        {/* â”€â”€ Standard Mode â”€â”€ */}
        {variantType === 'standard' && (
          <>
            <fieldset className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Image {initialData ? '(Optional)' : <span className="text-red-500">*</span>}</label>
              <input name="image" type="file" accept="image/*" required={!initialData} className="w-full text-sm text-gray-500 file:mr-4 file:px-5 file:py-3 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-black hover:file:bg-gray-200 cursor-pointer" />
              {initialData?.image_url && initialData?.variant_type !== 'gender' && initialData?.variant_type !== 'creative_ads' && <p className="text-xs text-gray-400 mt-2">Current image kept if no new upload.</p>}
            </fieldset>
            <fieldset className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Prompt Text <span className="text-red-500">*</span></label>
              <textarea name="prompt" required defaultValue={initialData?.prompt} rows={5} className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-medium resize-y leading-relaxed" />
            </fieldset>
          </>
        )}

        {/* â”€â”€ Gender Mode â”€â”€ */}
        {variantType === 'gender' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6 p-6 bg-gray-50 border border-gray-100 rounded-[24px]">
              <h3 className="font-bold text-gray-900">Male Variant</h3>
              <fieldset className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Male Image {initialData?.variant_type === 'gender' ? '(Optional)' : <span className="text-red-500">*</span>}</label>
                <input name="image_male" type="file" accept="image/*" required={initialData?.variant_type !== 'gender'} className="w-full text-sm text-gray-500 file:mr-4 file:px-4 file:py-2.5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-gray-100 cursor-pointer" />
              </fieldset>
              <fieldset className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Male Prompt <span className="text-red-500">*</span></label>
                <textarea name="prompt_male" required defaultValue={maleVariant?.prompt} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-black transition-all text-sm font-medium resize-y" />
              </fieldset>
            </div>
            <div className="space-y-6 p-6 bg-gray-50 border border-gray-100 rounded-[24px]">
              <h3 className="font-bold text-gray-900">Female Variant</h3>
              <fieldset className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Female Image {initialData?.variant_type === 'gender' ? '(Optional)' : <span className="text-red-500">*</span>}</label>
                <input name="image_female" type="file" accept="image/*" required={initialData?.variant_type !== 'gender'} className="w-full text-sm text-gray-500 file:mr-4 file:px-4 file:py-2.5 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-gray-100 cursor-pointer" />
              </fieldset>
              <fieldset className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Female Prompt <span className="text-red-500">*</span></label>
                <textarea name="prompt_female" required defaultValue={femaleVariant?.prompt} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-black transition-all text-sm font-medium resize-y" />
              </fieldset>
            </div>
          </div>
        )}

        {/* â”€â”€ Creative Ads Mode â”€â”€ */}
        {variantType === 'creative_ads' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">{adVariants.length} of 10 variants</p>
              <button type="button" onClick={addAdVariant} disabled={adVariants.length >= 10} className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold rounded-full bg-black text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <Plus className="w-4 h-4" /> Add Variant
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {adVariants.map((v, idx) => {
                const num = idx + 1
                const existingVariant = initialData?.variant_type === 'creative_ads' ? initialData?.variants?.[idx] : null
                return (
                  <div key={idx} className="relative p-5 bg-gray-50 border border-gray-200 rounded-[20px] space-y-4 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-black">{num}</span>
                        <h4 className="font-bold text-gray-900 text-sm">Variant {num}</h4>
                      </div>
                      {adVariants.length > 2 && (
                        <button type="button" onClick={() => removeAdVariant(idx)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <fieldset className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-500">Image {existingVariant ? '(Optional)' : <span className="text-red-500">*</span>}</label>
                      <input name={`image_ad_${num}`} type="file" accept="image/*" required={!existingVariant} className="w-full text-sm text-gray-500 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-black hover:file:bg-gray-100 cursor-pointer" />
                    </fieldset>
                    <fieldset className="space-y-1.5">
                      <label className="block text-xs font-semibold text-gray-500">Prompt <span className="text-red-500">*</span></label>
                      <textarea name={`prompt_ad_${num}`} required defaultValue={existingVariant?.prompt || v.prompt} rows={3} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-black transition-all text-sm font-medium resize-y" />
                    </fieldset>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Row: Category + Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <fieldset className="space-y-2">
            <label htmlFor="select-category" className="block text-sm font-semibold text-gray-700">Category</label>
            <select id="select-category" name="category_id" defaultValue={initialData?.category_id || ''} className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-medium appearance-none">
              <option value="">None</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </fieldset>
          <fieldset className="space-y-2">
            <label htmlFor="input-tags" className="block text-sm font-semibold text-gray-700">Tags</label>
            <input id="input-tags" name="tags" defaultValue={initialData?.tags?.map((t: any) => t.tag.name).join(', ')} placeholder="cinematic, portrait, rain" className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-medium" />
          </fieldset>
        </div>

        {/* Row: Model + Aspect Ratio + Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <fieldset className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Model</label>
            <input name="model" defaultValue={initialData?.model} className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-medium" />
          </fieldset>
          <fieldset className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Aspect Ratio</label>
            <input name="aspect_ratio" defaultValue={initialData?.aspect_ratio} className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-medium" />
          </fieldset>
          <fieldset className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Style</label>
            <input name="style" defaultValue={initialData?.style} className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:border-black focus:bg-white transition-all text-sm font-medium" />
          </fieldset>
        </div>

        {/* Source Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-[24px] border border-gray-100">
          <fieldset className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Creator Name</label>
            <input name="source_name" defaultValue={initialData?.source_name} className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-white focus:outline-none focus:border-black transition-all text-sm font-medium" />
          </fieldset>
          <fieldset className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Creator URL</label>
            <input name="source_url" type="url" defaultValue={initialData?.source_url} className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl bg-white focus:outline-none focus:border-black transition-all text-sm font-medium" />
          </fieldset>
        </div>

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
            <div className="relative flex items-center justify-center">
              <input name="is_featured" type="checkbox" defaultChecked={initialData?.is_featured} className="peer w-6 h-6 appearance-none border-2 border-gray-200 rounded-lg checked:bg-black checked:border-black transition-colors cursor-pointer" />
              <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none"><path d="M1.5 5.5L5 9L12.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-black transition-colors">Mark as Featured</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input name="is_premium" type="checkbox" defaultChecked={initialData?.is_premium} className="peer w-6 h-6 appearance-none border-2 border-gray-200 rounded-lg checked:bg-black checked:border-black transition-colors cursor-pointer" />
              <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" viewBox="0 0 14 10" fill="none"><path d="M1.5 5.5L5 9L12.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span className="text-sm font-semibold text-gray-700 group-hover:text-black transition-colors">Premium Only</span>
          </label>
        </div>

        {/* Submit */}
        <div className="pt-6">
          <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-10 py-4 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 disabled:opacity-70 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200">
            {isSubmitting ? 'Uploading...' : (initialData ? 'Update Prompt' : 'Create Prompt')}
          </button>
        </div>
      </form>
    </div>
  )
}
