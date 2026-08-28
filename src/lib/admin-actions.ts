'use server'

import { createClient as createAdminClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit/log'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// ── Prompts ──

async function uploadImageHelper(supabase: any, file: File | null, title: string) {
  if (!file || file.size === 0) return null;
  const ext = file.name.split('.').pop()
  const filePath = `${Date.now()}-${slugify(title)}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error: uploadError } = await supabase.storage
    .from('prompt-images')
    .upload(filePath, buffer, { contentType: file.type, upsert: true })
  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)
  const { data: { publicUrl } } = supabase.storage.from('prompt-images').getPublicUrl(filePath)
  return publicUrl;
}

export async function createPrompt(formData: FormData) {
  const { supabase, user } = await requireAdmin()

  const title = formData.get('title') as string
  const categoryId = formData.get('category_id') as string || null
  const model = formData.get('model') as string || null
  const aspectRatio = formData.get('aspect_ratio') as string || null
  const style = formData.get('style') as string || null
  const sourceName = formData.get('source_name') as string || null
  const sourceUrl = formData.get('source_url') as string || null
  const status = formData.get('status') as string || 'draft'
  const isFeatured = formData.get('is_featured') === 'on'
  const isPremium = formData.get('is_premium') === 'on'
  const variantType = formData.get('variant_type') as string || 'standard'
  const hasVariants = variantType !== 'standard'
  const tags = (formData.get('tags') as string || '').split(',').map(t => t.trim()).filter(Boolean)

  let mainPrompt = '';
  let mainImageUrl = '';
  let variants: any = null;

  if (variantType === 'gender') {
    const malePrompt = formData.get('prompt_male') as string
    const femalePrompt = formData.get('prompt_female') as string
    const maleImageUrl = await uploadImageHelper(supabase, formData.get('image_male') as File, title + '-male')
    const femaleImageUrl = await uploadImageHelper(supabase, formData.get('image_female') as File, title + '-female')
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
      const adImageUrl = await uploadImageHelper(supabase, formData.get(`image_ad_${i}`) as File, title + `-ad-${i}`)
      if (!adImageUrl) throw new Error(`Image for Variant ${i} is required`)
      variants.push({ id: i, label: `Variant ${i}`, prompt: adPrompt, image_url: adImageUrl })
    }
    mainPrompt = variants[0].prompt
    mainImageUrl = variants[0].image_url
  } else {
    mainPrompt = formData.get('prompt') as string
    const uploadedUrl = await uploadImageHelper(supabase, formData.get('image') as File, title)
    if (!uploadedUrl) throw new Error('Image is required')
    mainImageUrl = uploadedUrl
  }

  const { data: newPrompt, error } = await supabase.from('prompts').insert({
    title,
    slug: slugify(title) + '-' + Date.now().toString(36),
    prompt: mainPrompt,
    image_url: mainImageUrl,
    category_id: categoryId || null,
    model,
    aspect_ratio: aspectRatio,
    style,
    source_name: sourceName,
    source_url: sourceUrl,
    status,
    is_featured: isFeatured,
    is_premium: isPremium,
    has_variants: hasVariants,
    variant_type: variantType,
    variants: hasVariants ? variants : null,
    created_by: user.id,
    published_at: status === 'published' ? new Date().toISOString() : null,
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

  await logAuditEvent({
    actorUserId: user.id,
    action: 'prompt.create',
    resourceType: 'prompt',
    resourceId: newPrompt?.id,
    after: { title, status, is_premium: isPremium, variant_type: variantType },
  })

  revalidatePath('/admin/prompts')
  redirect('/admin/prompts')
}

export async function updatePrompt(id: string, formData: FormData) {
  const { supabase, user } = await requireAdmin()
  const { data: before } = await supabase.from('prompts').select('*').eq('id', id).single()

  const title = formData.get('title') as string
  const status = formData.get('status') as string || 'draft'
  const isPremium = formData.get('is_premium') === 'on'
  const variantType = formData.get('variant_type') as string || 'standard'
  const hasVariants = variantType !== 'standard'

  const updates: Record<string, unknown> = {
    title,
    category_id: (formData.get('category_id') as string) || null,
    model: formData.get('model') as string || null,
    aspect_ratio: formData.get('aspect_ratio') as string || null,
    style: formData.get('style') as string || null,
    source_name: formData.get('source_name') as string || null,
    source_url: formData.get('source_url') as string || null,
    status,
    is_featured: formData.get('is_featured') === 'on',
    is_premium: isPremium,
    has_variants: hasVariants,
    variant_type: variantType,
    updated_at: new Date().toISOString(),
  }

  if (status === 'published') updates.published_at = new Date().toISOString()

  if (variantType === 'gender') {
    const malePrompt = formData.get('prompt_male') as string
    const femalePrompt = formData.get('prompt_female') as string
    const maleImageUrl = await uploadImageHelper(supabase, formData.get('image_male') as File, title + '-male')
    const femaleImageUrl = await uploadImageHelper(supabase, formData.get('image_female') as File, title + '-female')

    const existingVariants = before?.variants || []
    const existingMale = existingVariants.find((v: any) => v.gender === 'male')
    const existingFemale = existingVariants.find((v: any) => v.gender === 'female')

    const finalMaleUrl = maleImageUrl || existingMale?.image_url || before?.image_url
    const finalFemaleUrl = femaleImageUrl || existingFemale?.image_url

    if (!finalMaleUrl || !finalFemaleUrl) throw new Error('Both variant images must be uploaded or exist')

    updates.prompt = malePrompt
    updates.image_url = finalMaleUrl
    updates.variants = [
      { gender: 'male', prompt: malePrompt, image_url: finalMaleUrl },
      { gender: 'female', prompt: femalePrompt, image_url: finalFemaleUrl }
    ]
  } else if (variantType === 'creative_ads') {
    const count = parseInt(formData.get('ad_variant_count') as string || '2')
    const existingVariants = before?.variant_type === 'creative_ads' ? (before?.variants || []) : []
    const newVariants: any[] = []

    for (let i = 1; i <= count; i++) {
      const adPrompt = formData.get(`prompt_ad_${i}`) as string
      const adImageUrl = await uploadImageHelper(supabase, formData.get(`image_ad_${i}`) as File, title + `-ad-${i}`)
      const existingUrl = existingVariants[i - 1]?.image_url
      const finalUrl = adImageUrl || existingUrl
      if (!finalUrl) throw new Error(`Image for Variant ${i} is required`)
      newVariants.push({ id: i, label: `Variant ${i}`, prompt: adPrompt, image_url: finalUrl })
    }

    updates.prompt = newVariants[0].prompt
    updates.image_url = newVariants[0].image_url
    updates.variants = newVariants
  } else {
    updates.prompt = formData.get('prompt') as string
    const uploadedUrl = await uploadImageHelper(supabase, formData.get('image') as File, title)
    if (uploadedUrl) updates.image_url = uploadedUrl
    updates.variants = null
  }

  const { error } = await supabase.from('prompts').update(updates).eq('id', id)
  if (error) throw new Error(error.message)

  const tags = (formData.get('tags') as string || '').split(',').map(t => t.trim()).filter(Boolean)
  await supabase.from('prompt_tags').delete().eq('prompt_id', id)
  for (const tagName of tags) {
    const tagSlug = slugify(tagName)
    let { data: tag } = await supabase.from('tags').select('id').eq('slug', tagSlug).single()
    if (!tag) {
      const { data: newTag } = await supabase.from('tags').insert({ name: tagName, slug: tagSlug }).select('id').single()
      tag = newTag
    }
    if (tag) {
      await supabase.from('prompt_tags').insert({ prompt_id: id, tag_id: tag.id })
    }
  }

  await logAuditEvent({
    actorUserId: user.id,
    action: 'prompt.update',
    resourceType: 'prompt',
    resourceId: id,
    before: before ? { title: before.title, status: before.status, is_premium: before.is_premium } : undefined,
    after: { title, status, is_premium: isPremium, variant_type: variantType },
  })

  revalidatePath('/admin/prompts')
  redirect('/admin/prompts')
}

export async function deletePrompt(id: string) {
  const { supabase, user } = await requireAdmin()
  const { data: before } = await supabase.from('prompts').select('title, status').eq('id', id).single()

  await supabase.from('prompts').update({ status: 'archived' }).eq('id', id)

  await logAuditEvent({
    actorUserId: user.id,
    action: 'prompt.archive',
    resourceType: 'prompt',
    resourceId: id,
    before: before ? { title: before.title, status: before.status } : undefined,
    after: { status: 'archived' },
  })

  revalidatePath('/admin/prompts')
}

// ── Categories ──

export async function createCategory(formData: FormData) {
  const { supabase, user } = await requireAdmin()
  const name = formData.get('name') as string
  const { data, error } = await supabase.from('categories').insert({
    name,
    slug: slugify(name),
    description: formData.get('description') as string || null,
  }).select('id').single()
  if (error) throw new Error(error.message)

  await logAuditEvent({
    actorUserId: user.id,
    action: 'category.create',
    resourceType: 'category',
    resourceId: data?.id,
    after: { name },
  })

  revalidatePath('/admin/categories')
}

export async function deleteCategory(id: string) {
  const { supabase, user } = await requireAdmin()
  const { data: before } = await supabase.from('categories').select('name').eq('id', id).single()

  await supabase.from('categories').delete().eq('id', id)

  await logAuditEvent({
    actorUserId: user.id,
    action: 'category.delete',
    resourceType: 'category',
    resourceId: id,
    before: before ? { name: before.name } : undefined,
  })

  revalidatePath('/admin/categories')
}

// ── Tags ──

export async function createTag(formData: FormData) {
  const { supabase, user } = await requireAdmin()
  const name = formData.get('name') as string
  const { data, error } = await supabase.from('tags').insert({ name, slug: slugify(name) }).select('id').single()
  if (error) throw new Error(error.message)

  await logAuditEvent({
    actorUserId: user.id,
    action: 'tag.create',
    resourceType: 'tag',
    resourceId: data?.id,
    after: { name },
  })

  revalidatePath('/admin/tags')
}

export async function deleteTag(id: string) {
  const { supabase, user } = await requireAdmin()
  const { data: before } = await supabase.from('tags').select('name').eq('id', id).single()

  await supabase.from('tags').delete().eq('id', id)

  await logAuditEvent({
    actorUserId: user.id,
    action: 'tag.delete',
    resourceType: 'tag',
    resourceId: id,
    before: before ? { name: before.name } : undefined,
  })

  revalidatePath('/admin/tags')
}

export async function resolveTicket(id: string) {
  const { supabase, user } = await requireAdmin()
  const { error } = await supabase
    .from('support_tickets')
    .update({ status: 'resolved' })
    .eq('id', id)
  
  if (error) return { error: error.message }

  await logAuditEvent({
    actorUserId: user.id,
    action: 'ticket.resolve',
    resourceType: 'ticket',
    resourceId: id,
  })

  revalidatePath('/admin/tickets')
  return { success: true }
}

export async function updateUserRole(formData: FormData) {
  const { supabase, user } = await requireAdmin()
  const targetUserId = formData.get('userId') as string
  const newRole = formData.get('role') as string

  if (!targetUserId || !newRole) return

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: before } = await supabaseAdmin.from('profiles').select('role').eq('id', targetUserId).single()

  const { error } = await supabaseAdmin.from('profiles').update({ role: newRole }).eq('id', targetUserId)
  if (error) throw new Error(error.message)

  await logAuditEvent({
    actorUserId: user.id,
    action: 'member.update_role',
    resourceType: 'profile',
    resourceId: targetUserId,
    before: before ? { role: before.role } : undefined,
    after: { role: newRole },
  })

  revalidatePath('/admin/members')
}

export async function deleteUser(userId: string) {
  const { user } = await requireAdmin() // Verify admin caller

  if (userId === user.id) {
    throw new Error('You cannot delete your own account.')
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (error) {
    throw new Error('Failed to delete user: ' + error.message)
  }

  revalidatePath('/admin/members')
  return { success: true }
}

