import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mira-prompts.vercel.app'
const SITE_NAME = 'Mira Prompts'
const DEFAULT_DESCRIPTION = 'Curated AI image prompts for Midjourney, DALL-E, and Stable Diffusion'

export function buildMetadata(options: {
  title?: string
  description?: string
  path?: string
  image?: string
  type?: 'website' | 'article'
  noIndex?: boolean
}): Metadata {
  const title = options.title
    ? `${options.title} | ${SITE_NAME}`
    : SITE_NAME

  const url = options.path ? `${SITE_URL}${options.path}` : SITE_URL
  const image = options.image ?? `${SITE_URL}/brand/preview.png`

  return {
    title,
    description: options.description ?? DEFAULT_DESCRIPTION,
    openGraph: {
      title,
      description: options.description ?? DEFAULT_DESCRIPTION,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630 }],
      type: options.type ?? 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: options.description ?? DEFAULT_DESCRIPTION,
      images: [image],
    },
    alternates: { canonical: url },
    robots: options.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}

export function buildPromptMetadata(prompt: {
  title: string
  description?: string
  slug: string
  image_url: string
  model?: string
  style?: string
  category?: { name: string }
}): Metadata {
  const description = prompt.description
    || `AI prompt: ${prompt.title}${prompt.model ? ` for ${prompt.model}` : ''}${prompt.category ? ` in ${prompt.category.name}` : ''}`

  return buildMetadata({
    title: prompt.title,
    description,
    path: `/prompts/${prompt.slug}`,
    image: prompt.image_url,
    type: 'article',
  })
}

export function buildCategoryMetadata(category: {
  name: string
  slug: string
  description?: string
}): Metadata {
  return buildMetadata({
    title: `${category.name} Prompts`,
    description: category.description
      || `Browse curated AI image prompts in the ${category.name} category`,
    path: `/categories/${category.slug}`,
  })
}
