import { requireUser, type AuthResult } from './require-user'

export type Role = 'admin' | 'editor' | 'user'

export type RoleResult = AuthResult & {
  profile: { id: string; role: Role }
}

export async function requireRole(...allowedRoles: Role[]): Promise<RoleResult> {
  const { user, supabase } = await requireUser()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    throw new Error('Profile not found')
  }

  if (!allowedRoles.includes(profile.role as Role)) {
    throw new Error('Not authorized')
  }

  return { user, supabase, profile: profile as { id: string; role: Role } }
}

export async function getUserRole(userId: string): Promise<Role | null> {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  return data?.role as Role | null ?? null
}
