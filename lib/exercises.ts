import type { Lang } from '@/lib/i18n'

export type ExerciseDifficulty = 'beginner' | 'intermediate'

export type ExerciseStep = {
  instruction_es: string
  instruction_en: string
  icon: string
  duration_sec?: number | null
}

export type Exercise = {
  id: number
  title_es: string
  title_en: string
  description_es: string
  description_en: string
  icon: string
  duration_min: number
  difficulty: ExerciseDifficulty
  steps: ExerciseStep[]
  sort_order: number
}

export type DurationFilter = 'all' | '5' | '10' | '15plus'
export type DifficultyFilter = 'all' | ExerciseDifficulty

export function getExerciseTitle(exercise: Exercise, lang: Lang): string {
  return lang === 'en' ? exercise.title_en : exercise.title_es
}

export function getExerciseDescription(exercise: Exercise, lang: Lang): string {
  return lang === 'en' ? exercise.description_en : exercise.description_es
}

export function getStepInstruction(step: ExerciseStep, lang: Lang): string {
  return lang === 'en' ? step.instruction_en : step.instruction_es
}

export function getDifficultyLevel(difficulty: ExerciseDifficulty): number {
  return difficulty === 'beginner' ? 1 : 2
}

export function matchesDurationFilter(durationMin: number, filter: DurationFilter): boolean {
  if (filter === 'all') return true
  if (filter === '5') return durationMin <= 5
  if (filter === '10') return durationMin >= 6 && durationMin <= 10
  return durationMin >= 11
}

export function matchesDifficultyFilter(
  difficulty: ExerciseDifficulty,
  filter: DifficultyFilter,
): boolean {
  if (filter === 'all') return true
  return difficulty === filter
}
