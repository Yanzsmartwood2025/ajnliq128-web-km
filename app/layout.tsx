import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toast'

export const metadata: Metadata = {
  title: 'AJNLIQ128 — FUEGO',
  description: 'Enter the AJNLIQ128 constellation.',
  generator: 'FUEGO',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'AJNLIQ128',
    statusBarStyle: 'black-translucent',
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
    <html lang="es" className="bg-background">
      <body className="antialiased">
        <Toaster>
          {children}
        </Toaster>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
