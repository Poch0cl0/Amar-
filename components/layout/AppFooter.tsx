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

  const socialLinks = [
    { label: copy.email, href: `mailto:${CONTACT.email}`, external: false },
    { label: copy.instagram, href: CONTACT.instagram, external: true },
    { label: copy.tiktok, href: CONTACT.tiktok, external: true },
    { label: copy.facebook, href: CONTACT.facebook, external: true },
  ]

  return (
    <footer className="border-t border-earth-200/70 bg-sand-100/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 lg:grid-cols-[1.3fr_0.7fr_0.8fr] lg:px-8">
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
                    className="inline-flex min-h-11 items-center gap-2 py-1.5 transition hover:text-earth-900"
                  >
                    <span className="font-medium text-earth-700">{item.label}</span>
                    <span className="text-earth-400" aria-hidden>
                      ↗
                    </span>
                  </a>
                ) : (
                  <a
                    href={item.href}
                    className="block transition hover:text-earth-900"
                  >
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
