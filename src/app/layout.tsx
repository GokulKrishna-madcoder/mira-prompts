import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"
import NextTopLoader from 'nextjs-toploader';
import CookieBanner from '@/components/ui/CookieBanner';
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
  verification: {
    google: '8Q2AOZ6mk8oEHybDHJREJ6ptORoFhuJpF1bEW0flg-A'
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mira-prompts.vercel.app',
    siteName: 'Mira Prompts',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mira Prompts',
    description: 'Discover, copy, and save beautifully curated AI image prompts.',
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
        <NextTopLoader color="#ef4444" height={3} showSpinner={false} />
        {children}
        <CookieBanner />

        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-314HGDRVHH"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-314HGDRVHH');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  )
}
