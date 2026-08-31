import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Manrope } from 'next/font/google'
import { AppShell } from '@/components/layout/AppShell'
import { LocaleProvider } from '@/components/providers/LocaleProvider'
import './globals.css'

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  title: 'Amara',
  description:
    'Landing de bienestar para Amara con melodias, productos relajantes y una experiencia visual suave.',
}

export const viewport: Viewport = {
  themeColor: '#4f3f38',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${cormorant.variable}`}
    >
      <body className="bg-sand-50 text-earth-950 antialiased">
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(166,201,185,0.2),_transparent_35%),linear-gradient(180deg,_#fcfaf5_0%,_#f6f0e8_100%)]">
          <LocaleProvider>
            <AppShell>{children}</AppShell>
          </LocaleProvider>
        </div>
      </body>
    </html>
  )
}
