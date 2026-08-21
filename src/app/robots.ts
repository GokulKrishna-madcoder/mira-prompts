import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/settings/',
        '/saved/',
        '/api/'
      ],
    },
    sitemap: 'https://mira.vercel.app/sitemap.xml',
  }
}
