import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { PwaUpdater } from '@/components/PwaUpdater'
import { Toaster } from '@/components/ui/toast'
import { AuthProvider } from '@/lib/auth-context'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://ajnliq128.com'),
  title: 'AJNLIQ128 — FUEGO',
  description: 'Enter the AJNLIQ128 constellation.',
  generator: 'FUEGO',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'AJNLIQ128',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    images: ['/opengraph-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/twitter-image.png'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-transparent">
        <AuthProvider>
          <Toaster>
            {children}
          </Toaster>
          <PwaUpdater />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </AuthProvider>
      </body>
    </html>
  )
}
