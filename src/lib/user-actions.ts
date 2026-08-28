'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function toggleSave(promptId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not signed in' }

  const { data: existing } = await supabase
    .from('prompt_saves')
    .select('id')
    .eq('user_id', user.id)
    .eq('prompt_id', promptId)
    .single()

  const isSaved = !!existing

  if (existing) {
    await supabase.from('prompt_saves').delete().eq('id', existing.id)
  } else {
    await supabase.from('prompt_saves').insert({ user_id: user.id, prompt_id: promptId })
  }

  revalidatePath('/saved')
  revalidatePath(`/prompts/${promptId}`)
  return isSaved ? false : true
}

export async function toggleLike(promptId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Must be logged in to like')

  // Check if liked
  const { data: existing } = await supabase
    .from('prompt_likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('prompt_id', promptId)
    .single()

  const isLiked = !!existing

  if (isLiked) {
    await supabase.from('prompt_likes').delete().eq('id', existing.id)
  } else {
    await supabase.from('prompt_likes').insert({ user_id: user.id, prompt_id: promptId })
  }

  revalidatePath('/')
  revalidatePath(`/prompts/${promptId}`)
  return isLiked ? false : true
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const displayName = formData.get('display_name') as string
  const bio = formData.get('bio') as string
  const username = formData.get('username') as string || null

  const social_links = {
    instagram: formData.get('social_instagram') as string || '',
    youtube: formData.get('social_youtube') as string || '',
    facebook: formData.get('social_facebook') as string || '',
    x: formData.get('social_x') as string || '',
    pinterest: formData.get('social_pinterest') as string || '',
  }

  let avatarUrl = undefined
  const avatarFile = formData.get('avatar') as File
  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split('.').pop()
    const filePath = `avatars/${user.id}-${Date.now()}.${ext}`
    const buffer = Buffer.from(await avatarFile.arrayBuffer())
    const { error: uploadError } = await supabase.storage
      .from('prompt-images') // Reusing existing bucket since avatars isn't created
      .upload(filePath, buffer, { contentType: avatarFile.type, upsert: true })
    if (!uploadError) {
      avatarUrl = supabase.storage.from('prompt-images').getPublicUrl(filePath).data.publicUrl
    }
  }

  const updates: any = {
    display_name: displayName,
    username,
    bio,
    social_links,
    updated_at: new Date().toISOString(),
  }
  if (avatarUrl) updates.avatar_url = avatarUrl

  const { error } = await supabase.from('profiles').update(updates).eq('id', user.id)

  if (error) {
    if (error.message.includes('unique constraint')) return { error: 'Username is already taken' }
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/')
  return { success: true }
}

export async function updatePreferences(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const prefsStr = formData.get('preferences') as string
  let preferences = {}
  try {
    preferences = JSON.parse(prefsStr)
  } catch (e) {
    return { error: 'Invalid preferences data' }
  }

  const { error } = await supabase.from('profiles').update({
    preferences,
    updated_at: new Date().toISOString(),
  }).eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/preferences')
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const newPassword = formData.get('new_password') as string
  if (!newPassword || newPassword.length < 6) return { error: 'Password must be at least 6 characters' }

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: error.message }
  return { success: true }
}

export async function submitFeedback(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Must be logged in' }

  const { error } = await supabase.from('support_tickets').insert({
    user_id: user.id,
    message: formData.get('message') as string,
  })
  
  if (error) return { error: error.message }
  return { success: true }
}

export async function markNotificationsRead(formData?: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Must be logged in' }

  const { error } = await supabase.from('profiles')
    .update({ last_notification_read_at: new Date().toISOString() })
    .eq('id', user.id)
    
  if (error) return { error: error.message }
  return { success: true }
}

// â”€â”€ Prompt Submission â”€â”€

async function uploadUserImage(supabase: any, file: File | null, title: string) {
  if (!file || file.size === 0) return null
  const ext = file.name.split('.').pop()
  const filePath = `user-submissions/${Date.now()}-${slugify(title)}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error } = await supabase.storage
    .from('prompt-images')
    .upload(filePath, buffer, { contentType: file.type, upsert: true })
  if (error) throw new Error(`Upload failed: ${error.message}`)
  const { data: { publicUrl } } = supabase.storage.from('prompt-images').getPublicUrl(filePath)
  return publicUrl
}

export async function submitPrompt(formData: FormData) {
  const userSupabase = await createClient()
  const { data: { user } } = await userSupabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const title = formData.get('title') as string
  const isDraft = formData.get('action') === 'draft'
  const status = isDraft ? 'draft' : 'pending'
  const variantType = formData.get('variant_type') as string || 'standard'
  const hasVariants = variantType !== 'standard'
  const tags = (formData.get('tags') as string || '').split(',').map(t => t.trim()).filter(Boolean)

  if (!title) throw new Error('Title is required')
  if (tags.length === 0 && !isDraft) throw new Error('At least one tag is required')
  if (tags.length > 5) throw new Error('Maximum 5 tags allowed')

  let mainPrompt = ''
  let mainImageUrl = ''
  let variants: any = null

  if (variantType === 'gender') {
    const malePrompt = formData.get('prompt_male') as string
    const femalePrompt = formData.get('prompt_female') as string
    const maleImageUrl = await uploadUserImage(supabase, formData.get('image_male') as File, title + '-male')
    const femaleImageUrl = await uploadUserImage(supabase, formData.get('image_female') as File, title + '-female')
    if (!maleImageUrl || !femaleImageUrl) throw new Error('Both gender variant images are required')
    mainPrompt = malePrompt
    mainImageUrl = maleImageUrl
    variants = [
      { gender: 'male', prompt: malePrompt, image_url: maleImageUrl },
      { gender: 'female', prompt: femalePrompt, image_url: femaleImageUrl }
    ]
  } else if (variantType === 'creative_ads') {
    const count = parseInt(formData.get('ad_variant_count') as string || '2')
    variants = []
    for (let i = 1; i <= count; i++) {
      const adPrompt = formData.get(`prompt_ad_${i}`) as string
      const adImageUrl = await uploadUserImage(supabase, formData.get(`image_ad_${i}`) as File, title + `-ad-${i}`)
      if (!adImageUrl) throw new Error(`Image for Variant ${i} is required`)
      variants.push({ id: i, label: `Variant ${i}`, prompt: adPrompt, image_url: adImageUrl })
    }
    mainPrompt = variants[0].prompt
    mainImageUrl = variants[0].image_url
  } else {
    mainPrompt = formData.get('prompt') as string
    const uploadedUrl = await uploadUserImage(supabase, formData.get('image') as File, title)
    if (!uploadedUrl) throw new Error('Image is required')
    mainImageUrl = uploadedUrl
  }

  const aiTool = formData.get('ai_tool') as string || null
  const customToolName = formData.get('custom_tool_name') as string || null
  const customToolUrl = formData.get('custom_tool_url') as string || null

  const { data: newPrompt, error } = await supabase.from('prompts').insert({
    title,
    slug: slugify(title) + '-' + Date.now().toString(36),
    prompt: mainPrompt,
    image_url: mainImageUrl,
    category_id: (formData.get('category_id') as string) || null,
    model: formData.get('model') as string || null,
    aspect_ratio: formData.get('aspect_ratio') as string || null,
    style: formData.get('style') as string || null,
    source_name: aiTool || customToolName || null,
    source_url: customToolUrl || null,
    status,
    is_featured: false,
    is_premium: false,
    has_variants: hasVariants,
    variant_type: variantType,
    variants: hasVariants ? variants : null,
    created_by: user.id,
    published_at: null,
  }).select('id').single()

  if (error) throw new Error(error.message)

  if (tags.length > 0 && newPrompt) {
    for (const tagName of tags) {
      const tagSlug = slugify(tagName)
      let { data: tag } = await supabase.from('tags').select('id').eq('slug', tagSlug).single()
      if (!tag) {
        const { data: newTag } = await supabase.from('tags').insert({ name: tagName, slug: tagSlug }).select('id').single()
        tag = newTag
      }
      if (tag) {
        await supabase.from('prompt_tags').insert({ prompt_id: newPrompt.id, tag_id: tag.id })
      }
    }
  }

  const newCategoryName = formData.get('new_category') as string
  if (newCategoryName && !formData.get('category_id')) {
    const catSlug = slugify(newCategoryName)
    const { data: newCat } = await supabase.from('categories').insert({ name: newCategoryName, slug: catSlug }).select('id').single()
    if (newCat) {
      await supabase.from('prompts').update({ category_id: newCat.id }).eq('id', newPrompt.id)
    }
  }

  revalidatePath('/posts')
  redirect('/posts')
}
