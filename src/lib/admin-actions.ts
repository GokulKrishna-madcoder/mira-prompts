'use server'

import { requireAdmin } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit/log'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// ── Prompts ──

export async function createPrompt(formData: FormData) {
  const { supabase, user } = await requireAdmin()

  const title = formData.get('title') as string
  const prompt = formData.get('prompt') as string
  const categoryId = formData.get('category_id') as string || null
  const model = formData.get('model') as string || null
  const aspectRatio = formData.get('aspect_ratio') as string || null
  const style = formData.get('style') as string || null
  const sourceName = formData.get('source_name') as string || null
  const sourceUrl = formData.get('source_url') as string || null
  const status = formData.get('status') as string || 'draft'
  const isFeatured = formData.get('is_featured') === 'on'
  const tags = (formData.get('tags') as string || '').split(',').map(t => t.trim()).filter(Boolean)

  // Handle image upload
  const imageFile = formData.get('image') as File
  if (!imageFile || imageFile.size === 0) throw new Error('Image is required')

  const ext = imageFile.name.split('.').pop()
  const filePath = `${Date.now()}-${slugify(title)}.${ext}`

  const buffer = Buffer.from(await imageFile.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from('prompt-images')
    .upload(filePath, buffer, { 
      contentType: imageFile.type,
      upsert: true 
    })

  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

  const { data: { publicUrl } } = supabase.storage.from('prompt-images').getPublicUrl(filePath)

  const { data: newPrompt, error } = await supabase.from('prompts').insert({
    title,
    slug: slugify(title) + '-' + Date.now().toString(36),
    prompt,
    image_url: publicUrl,
    category_id: categoryId || null,
    model,
    aspect_ratio: aspectRatio,
    style,
    source_name: sourceName,
    source_url: sourceUrl,
    status,
    is_featured: isFeatured,
    is_premium: formData.get('is_premium') === 'on',
    created_by: user.id,
    published_at: status === 'published' ? new Date().toISOString() : null,
  }).select('id').single()

  if (error) throw new Error(error.message)

  // Handle tags
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
    after: { title, status, is_premium: formData.get('is_premium') === 'on' },
  })

  revalidatePath('/admin/prompts')
  redirect('/admin/prompts')
}

export async function updatePrompt(id: string, formData: FormData) {
  const { supabase, user } = await requireAdmin()

  // Fetch current state for audit
  const { data: before } = await supabase.from('prompts').select('*').eq('id', id).single()

  const title = formData.get('title') as string
  const status = formData.get('status') as string || 'draft'

  const updates: Record<string, unknown> = {
    title,
    prompt: formData.get('prompt') as string,
    category_id: (formData.get('category_id') as string) || null,
    model: formData.get('model') as string || null,
    aspect_ratio: formData.get('aspect_ratio') as string || null,
    style: formData.get('style') as string || null,
    source_name: formData.get('source_name') as string || null,
    source_url: formData.get('source_url') as string || null,
    status,
    is_featured: formData.get('is_featured') === 'on',
    is_premium: formData.get('is_premium') === 'on',
    updated_at: new Date().toISOString(),
  }

  if (status === 'published') updates.published_at = new Date().toISOString()

  // Handle optional new image
  const imageFile = formData.get('image') as File
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop()
    const filePath = `${Date.now()}-${slugify(title)}.${ext}`
    
    const buffer = Buffer.from(await imageFile.arrayBuffer())
    
    const { error: uploadError } = await supabase.storage
      .from('prompt-images')
      .upload(filePath, buffer, { 
        contentType: imageFile.type,
        upsert: true
      })
      
    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)
    const { data: { publicUrl } } = supabase.storage.from('prompt-images').getPublicUrl(filePath)
    updates.image_url = publicUrl
  }

  const { error } = await supabase.from('prompts').update(updates).eq('id', id)
  if (error) throw new Error(error.message)

  // Handle tags
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
    after: { title, status, is_premium: formData.get('is_premium') === 'on' },
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

  const { data: before } = await supabase.from('profiles').select('role').eq('id', targetUserId).single()

  const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', targetUserId)
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
