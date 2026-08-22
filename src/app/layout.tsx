import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL('https://mira-prompts.vercel.app'),
  title: {
    default: "Mira Prompts",
    template: "%s | Mira Prompts"
  },
  description: "Discover, copy, and save beautifully curated AI image prompts.",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mira-prompts.vercel.app',
    siteName: 'Mira Prompts',
    images: [{
      url: '/brand/preview.png',
      width: 1200,
      height: 630,
      alt: 'Mira Prompts',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mira Prompts',
    description: 'Discover, copy, and save beautifully curated AI image prompts.',
    images: ['/brand/preview.png'],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/brand/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/favicon-16x16.png', sizes: '16x16', type: 'image/png' }
    ],
    shortcut: '/brand/favicon-96x96.png',
    apple: [
      { url: '/brand/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Mira Prompts',
    url: 'https://mira-prompts.vercel.app',
    description: 'Discover, copy, and save beautifully curated AI image prompts.',
  }

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex bg-[var(--color-background)] text-[var(--color-text)]" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  )
}
