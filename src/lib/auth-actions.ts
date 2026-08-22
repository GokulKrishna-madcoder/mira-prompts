'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { trackEvent } from '@/lib/analytics/events'

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: formData.get('password') as string,
  })
  if (error) return { error: error.message, email }
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const { error, data } = await supabase.auth.signUp({
    email,
    password: formData.get('password') as string,
    options: { data: { display_name: formData.get('name') as string } },
  })
  if (error) return { error: error.message }
  trackEvent({ eventName: 'signup', userId: data.user?.id }).catch(() => {})
  
  // If session is null, it means email confirmation is required
  if (!data.session) {
    return { success: true, email }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function resendVerification(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  if (!email) return { error: 'Email is required' }
  const { error } = await supabase.auth.resend({ type: 'signup', email })
  if (error) return { error: error.message }
  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') || 'http://localhost:3000'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) throw new Error(error.message)
  if (data.url) redirect(data.url)
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const headersList = await headers()
  const origin = headersList.get('origin') || 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/settings`,
  })
  if (error) return { error: error.message }
  return { success: true }
}
