'use client'

import { ExerciseCard } from '@/components/ejercicios/ExerciseCard'
import { SectionHeading } from '@/components/common/SectionHeading'
import { HomeSectionLink } from '@/components/home/HomeSectionLink'
import { useLocale } from '@/components/providers/LocaleProvider'
import { getTranslations } from '@/lib/i18n'
import { getExercises } from '@/lib/exercises-data'

export function HomeExercisesPreview() {
  const { lang } = useLocale()
  const copy = getTranslations(lang).home
  const exercises = getExercises().slice(0, 3)

  return (
    <section className="bg-[linear-gradient(180deg,_#fdf8f8_0%,_#F9F8F4_100%)] px-6 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={copy.exercisesEyebrow}
          title={copy.exercisesTitle}
          description={copy.exercisesDescription}
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {exercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} lang={lang} />
          ))}
        </div>

        <HomeSectionLink href="/ejercicios" label={copy.exercisesLink} />
      </div>
    </section>
  )
}
