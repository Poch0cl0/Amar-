'use client'

import { SectionHeading } from '@/components/common/SectionHeading'
import { useLocale } from '@/components/providers/LocaleProvider'
import { getTranslations } from '@/lib/i18n'

export function NosotrosPageContent() {
  const { lang } = useLocale()
  const copy = getTranslations(lang).nosotros

  return (
    <section className="overflow-x-hidden px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full min-w-0 max-w-7xl gap-12 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-8">
          <SectionHeading
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
          />

          <div className="space-y-5 text-base leading-8 text-earth-600">
            <p>{copy.paragraph1}</p>
            <p>{copy.paragraph2}</p>
          </div>
        </div>

        <div className="grid min-w-0 gap-5">
          <div className="overflow-hidden rounded-[2.5rem] bg-white p-3 shadow-soft">
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80"
              alt={copy.imageAlt}
              className="h-[22rem] w-full rounded-[2rem] object-cover"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-earth-200 bg-white p-6 shadow-card">
              <p className="font-display text-2xl text-earth-900">{copy.missionTitle}</p>
              <p className="mt-3 text-sm leading-7 text-earth-600">{copy.missionText}</p>
            </div>
            <div className="rounded-[2rem] border border-earth-200 bg-white p-6 shadow-card">
              <p className="font-display text-2xl text-earth-900">{copy.visionTitle}</p>
              <p className="mt-3 text-sm leading-7 text-earth-600">{copy.visionText}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
