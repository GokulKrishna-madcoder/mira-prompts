const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mira-prompts.vercel.app'

export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mira Prompts',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [],
  }
}

export function buildWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mira Prompts',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildPromptSchema(prompt: {
  title: string
  description?: string
  slug: string
  image_url: string
  model?: string
  style?: string
  category?: { name: string }
  view_count?: number
  created_at: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: prompt.title,
    description: prompt.description || `AI image prompt: ${prompt.title}`,
    url: `${SITE_URL}/prompts/${prompt.slug}`,
    image: prompt.image_url,
    keywords: [
      prompt.model,
      prompt.style,
      prompt.category?.name,
      'AI prompt',
      'image generation',
    ].filter(Boolean).join(', '),
    dateCreated: prompt.created_at,
    interactionStatistic: prompt.view_count
      ? {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/ViewAction',
          userInteractionCount: prompt.view_count,
        }
      : undefined,
  }
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  }
}

export function buildFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}
