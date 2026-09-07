export const getAvatarGradient = (letter: string) => {
  const gradients = [
    'bg-gradient-to-br from-blue-700 to-blue-950',
    'bg-gradient-to-br from-emerald-700 to-emerald-950',
    'bg-gradient-to-br from-purple-700 to-purple-950',
    'bg-gradient-to-br from-rose-700 to-rose-950',
    'bg-gradient-to-br from-amber-700 to-amber-950'
  ]
  if (!letter) return gradients[0]
  return gradients[letter.charCodeAt(0) % gradients.length]
}

export function resolveUserAvatar(
  profile?: { avatar_url?: string | null } | null,
  user?: { user_metadata?: { avatar_url?: string; picture?: string } } | null
): string | null {
  return profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null
}

export function resolveDisplayName(
  profile?: { display_name?: string | null } | null,
  user?: { email?: string; user_metadata?: { full_name?: string; name?: string } } | null
): string {
  return profile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
}
