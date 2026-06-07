'use client'

import { useMemo, useState } from 'react'
import { ExerciseCard } from '@/components/ejercicios/ExerciseCard'
import { useLocale } from '@/components/providers/LocaleProvider'
import { getTranslations } from '@/lib/i18n'
import { getExercises } from '@/lib/exercises-data'
import type { DifficultyFilter, DurationFilter } from '@/lib/exercises'
import { matchesDifficultyFilter, matchesDurationFilter } from '@/lib/exercises'

export function ExercisesCatalog() {
  const { lang } = useLocale()
  const copy = getTranslations(lang).ejercicios
  const exercises = getExercises()

  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all')

  const filtered = useMemo(
    () =>
      exercises.filter(
        (exercise) =>
          matchesDurationFilter(exercise.duration_min, durationFilter) &&
          matchesDifficultyFilter(exercise.difficulty, difficultyFilter),
      ),
    [difficultyFilter, durationFilter, exercises],
  )

  const durationOptions: { value: DurationFilter; label: string }[] = [
    { value: '5', label: copy.duration5 },
    { value: '10', label: copy.duration10 },
    { value: '15plus', label: copy.duration15 },
  ]

  const difficultyOptions: { value: DifficultyFilter; label: string }[] = [
    { value: 'beginner', label: copy.beginner },
    { value: 'intermediate', label: copy.intermediate },
  ]

  function toggleDuration(value: DurationFilter) {
    setDurationFilter((current) => (current === value ? 'all' : value))
  }

  function toggleDifficulty(value: DifficultyFilter) {
    setDifficultyFilter((current) => (current === value ? 'all' : value))
  }

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-6 rounded-2xl border border-rose-100/80 bg-white/70 p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-earth-500">
            {copy.filterDuration}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {durationOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleDuration(option.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  durationFilter === option.value
                    ? 'bg-rose-300 text-white'
                    : 'bg-rose-50 text-earth-700 hover:bg-rose-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-earth-500">
            {copy.filterDifficulty}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {difficultyOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleDifficulty(option.value)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  difficultyFilter === option.value
                    ? 'bg-rose-300 text-white'
                    : 'bg-rose-50 text-earth-700 hover:bg-rose-100'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center text-earth-600">{copy.noResults}</p>
      ) : (
        <div className="mt-10 grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          {filtered.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} lang={lang} />
          ))}
        </div>
      )}
    </div>
  )
}
