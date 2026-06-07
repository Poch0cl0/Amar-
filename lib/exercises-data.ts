import exercisesJson from '@/data/exercises.json'
import type { Exercise } from '@/lib/exercises'

export function getExercises(): Exercise[] {
  return (exercisesJson as Exercise[]).sort((a, b) => a.sort_order - b.sort_order)
}
