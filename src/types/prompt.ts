export type PromptCard = {
  id: string
  title: string
  slug: string
  image_url: string
  view_count?: number
  copy_count?: number
  is_premium?: boolean
  trending_score?: number
  has_variants?: boolean
  variants?: { image_url: string; prompt?: string; gender?: string }[]
  category?: { slug?: string; name?: string } | null
}
