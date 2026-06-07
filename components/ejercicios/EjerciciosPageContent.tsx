'use client'

import { SectionHeading } from '@/components/common/SectionHeading'
import { ExercisesCatalog } from '@/components/ejercicios/ExercisesCatalog'
import { useLocale } from '@/components/providers/LocaleProvider'
import { getTranslations } from '@/lib/i18n'

export function EjerciciosPageContent() {
  const { lang } = useLocale()
  const copy = getTranslations(lang).ejercicios

  return (
    <section className="bg-[linear-gradient(180deg,_#fdf8f8_0%,_#F9F8F4_50%,_#f6f0e8_100%)] px-6 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
          align="center"
        />

        <div className="mx-auto mt-8 max-w-2xl border-b border-rose-200/60" />

        <ExercisesCatalog />
      </div>
    </section>
  )
}
