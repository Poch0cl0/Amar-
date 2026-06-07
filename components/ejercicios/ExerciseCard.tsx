'use client'

import { useState } from 'react'
import type { Lang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n'
import type { Exercise } from '@/lib/exercises'
import {
  getDifficultyLevel,
  getExerciseDescription,
  getExerciseTitle,
} from '@/lib/exercises'
import { ExerciseIcon } from '@/components/ejercicios/ExerciseIcon'
import { ExerciseSteps } from '@/components/ejercicios/ExerciseSteps'

type ExerciseCardProps = {
  exercise: Exercise
  lang: Lang
}

export function ExerciseCard({ exercise, lang }: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(false)
  const copy = getTranslations(lang).ejercicios
  const title = getExerciseTitle(exercise, lang)
  const description = getExerciseDescription(exercise, lang)
  const difficultyLevel = getDifficultyLevel(exercise.difficulty)

  return (
    <article
      className={`flex w-full flex-col self-start overflow-hidden rounded-2xl bg-white shadow-card transition-shadow ${
        expanded ? 'ring-1 ring-rose-200/60' : ''
      }`}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-earth-800">
            <ExerciseIcon name={exercise.icon} className="h-7 w-7" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-display text-2xl leading-snug text-earth-900">{title}</h3>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-earth-700">
                {exercise.duration_min} {copy.minutes}
              </span>

              <div className="flex items-center gap-1" aria-label={copy.difficulty}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <span
                    key={`dot-${index}`}
                    className={`h-2 w-2 rounded-full ${
                      index < difficultyLevel ? 'bg-rose-400' : 'bg-rose-100'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-earth-600">{description}</p>

        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="mt-5 flex w-full items-center justify-between rounded-xl bg-earth-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-earth-700"
          aria-expanded={expanded}
        >
          <span>{expanded ? copy.hideSteps : copy.viewSteps}</span>
          <ChevronIcon className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <ExerciseSteps steps={exercise.steps} lang={lang} expanded={expanded} />
    </article>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}
