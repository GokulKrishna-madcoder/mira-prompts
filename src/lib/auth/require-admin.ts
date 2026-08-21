import { requireUser, type AuthResult } from './require-user'

export type AdminResult = AuthResult & {
  profile: { id: string; role: string }
}

export async function requireAdmin(): Promise<AdminResult> {
  const { user, supabase } = await requireUser()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    throw new Error('Profile not found')
  }

  if (!['admin', 'editor'].includes(profile.role)) {
    throw new Error('Not authorized')
  }

  return { user, supabase, profile }
}

export async function requireSuperAdmin(): Promise<AdminResult> {
  const { user, supabase, profile } = await requireAdmin()

  if (profile.role !== 'admin') {
    throw new Error('Super admin required')
  }

  return { user, supabase, profile }
}
