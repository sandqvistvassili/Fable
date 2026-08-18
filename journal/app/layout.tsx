import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import '@fontsource/literata/400.css'
import '@fontsource/literata/400-italic.css'
import '@fontsource/literata/600.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/600.css'
import './globals.css'

import { SITE, SITE_URL, AUTHOR } from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE.title,
    template: `%s · ${AUTHOR.name}`,
  },
  description: SITE.description,
  authors: [{ name: AUTHOR.name, url: SITE_URL }],
  creator: AUTHOR.name,
  openGraph: {
    type: 'website',
    siteName: AUTHOR.name,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    types: { 'application/rss+xml': '/rss.xml' },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#edeee9' },
    { media: '(prefers-color-scheme: dark)', color: '#131512' },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-surface focus:px-3 focus:py-2 focus:font-mach focus:text-small"
        >
          Skip to content
        </a>
        <div className="mx-auto flex min-h-screen w-full max-w-[62rem] flex-col gap-10 px-4 pb-10 pt-6 sm:gap-12 sm:px-8 sm:pt-10">
          {children}
        </div>
      </body>
    </html>
  )
}
