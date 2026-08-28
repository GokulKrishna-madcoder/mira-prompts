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
