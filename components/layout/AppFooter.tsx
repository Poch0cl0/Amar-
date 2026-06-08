'use client'

import Link from 'next/link'
import { useLocale } from '@/components/providers/LocaleProvider'
import { getTranslations } from '@/lib/i18n'

const CONTACT = {
  email: 'amaraserenitykit@gmail.com',
  instagram: 'https://www.instagram.com/p/DY7S72Akb4m/',
  tiktok: 'https://www.tiktok.com/@amaraserenitykit?is_from_webapp=1&sender_device=pc',
  facebook: 'https://www.facebook.com/profile.php?id=61590484861072',
} as const

export function AppFooter() {
  const { lang } = useLocale()
  const copy = getTranslations(lang).footer

  const exploreLinks = [
    { label: copy.home, href: '/' },
    { label: copy.products, href: '/productos' },
    { label: copy.melodies, href: '/melodias' },
    { label: copy.about, href: '/nosotros' },
  ]

  const socialLinks = [
    { label: copy.email, href: `mailto:${CONTACT.email}`, external: false },
    { label: copy.instagram, href: CONTACT.instagram, external: true },
    { label: copy.tiktok, href: CONTACT.tiktok, external: true },
    { label: copy.facebook, href: CONTACT.facebook, external: true },
  ]

  return (
    <footer className="border-t border-earth-200/70 bg-[#FFF9F7]">
      {/* Mobile */}
      <div className="px-6 py-10 text-center md:hidden">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-earth-600">
          {exploreLinks.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-earth-900">
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-earth-500">
          {socialLinks.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-earth-800"
              >
                {item.label}
              </a>
            ) : (
              <a key={item.label} href={item.href} className="transition hover:text-earth-800">
                {item.label}
              </a>
            ),
          )}
        </div>

        <p className="mt-6 font-display text-lg text-earth-900">Amará</p>
        <p className="mt-2 text-xs text-earth-500">{copy.copyright}</p>
      </div>

      {/* Desktop */}
      <div className="mx-auto hidden max-w-7xl gap-10 px-6 py-14 md:grid md:grid-cols-3 lg:grid-cols-[1.3fr_0.7fr_0.8fr] lg:px-8">
        <div className="space-y-4">
          <p className="font-display text-3xl italic text-earth-900">Amará</p>
          <p className="max-w-xl text-sm leading-7 text-earth-600">{copy.description}</p>
        </div>

        <div className="space-y-3 text-sm text-earth-600">
          <p className="font-semibold uppercase tracking-[0.3em] text-earth-500">{copy.explore}</p>
          <Link href="/" className="block hover:text-earth-900">
            {copy.home}
          </Link>
          <Link href="/melodias" className="block hover:text-earth-900">
            {copy.melodies}
          </Link>
          <Link href="/productos" className="block hover:text-earth-900">
            {copy.products}
          </Link>
          <Link href="/nosotros" className="block hover:text-earth-900">
            {copy.about}
          </Link>
        </div>

        <div className="space-y-3 text-sm text-earth-600">
          <p className="font-semibold uppercase tracking-[0.3em] text-earth-500">{copy.contact}</p>
          <ul className="space-y-2">
            {socialLinks.map((item) => (
              <li key={item.label}>
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 transition hover:text-earth-900"
                  >
                    <span className="font-medium text-earth-700">{item.label}</span>
                    <span className="text-earth-400" aria-hidden>
                      ↗
                    </span>
                  </a>
                ) : (
                  <a href={item.href} className="block transition hover:text-earth-900">
                    <span className="font-medium text-earth-700">{item.label}</span>
                    <span className="mt-0.5 block text-xs text-earth-500">{CONTACT.email}</span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
