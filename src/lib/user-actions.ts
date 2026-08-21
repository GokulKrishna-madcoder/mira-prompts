'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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

  const { error } = await supabase.from('profiles').update({
    display_name: displayName,
    bio,
    updated_at: new Date().toISOString(),
  }).eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/settings')
  revalidatePath('/')
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

export async function markNotificationsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Must be logged in' }

  const { error } = await supabase.from('profiles')
    .update({ last_notification_read_at: new Date().toISOString() })
    .eq('id', user.id)
    
  if (error) return { error: error.message }
  return { success: true }
}
