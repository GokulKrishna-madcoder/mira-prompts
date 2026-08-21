import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'

export type AuthResult = {
  user: User
  supabase: Awaited<ReturnType<typeof createClient>>
}

export async function requireUser(): Promise<AuthResult> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error('Not authenticated')
  }

  return { user, supabase }
}

export async function optionalUser(): Promise<AuthResult | null> {
  try {
    return await requireUser()
  } catch {
    return null
  }
}
