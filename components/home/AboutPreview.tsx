'use client'

import Link from 'next/link'
import { SectionHeading } from '@/components/common/SectionHeading'
import { useLocale } from '@/components/providers/LocaleProvider'
import { getTranslations } from '@/lib/i18n'

export function AboutPreview() {
  const { lang } = useLocale()
  const copy = getTranslations(lang).home.about

  return (
    <section className="bg-sage-50/80 px-6 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="overflow-hidden rounded-[2.5rem] bg-white p-3 shadow-soft">
          <img
            src="https://images.unsplash.com/photo-1519834785169-98be25ec3f84?auto=format&fit=crop&w=900&q=80"
            alt={copy.imageAlt}
            className="h-full min-h-[26rem] w-full rounded-[2rem] object-cover"
          />
        </div>

        <div className="space-y-6">
          <SectionHeading
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.8rem] border border-white/60 bg-white/80 p-6">
              <p className="font-display text-2xl text-earth-900">{copy.cardDesignTitle}</p>
              <p className="mt-3 text-sm leading-7 text-earth-600">{copy.cardDesignText}</p>
            </div>
            <div className="rounded-[1.8rem] border border-white/60 bg-white/80 p-6">
              <p className="font-display text-2xl text-earth-900">{copy.cardCareTitle}</p>
              <p className="mt-3 text-sm leading-7 text-earth-600">{copy.cardCareText}</p>
            </div>
          </div>

          <Link
            href="/nosotros"
            className="inline-flex rounded-full border border-earth-300 bg-white px-6 py-3 text-sm font-semibold text-earth-800 transition hover:border-rose-300 hover:text-rose-500"
          >
            {copy.eyebrow} →
          </Link>
        </div>
      </div>
    </section>
  )
}
