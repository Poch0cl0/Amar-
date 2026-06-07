'use client'

import type { EmotionLog } from '@/lib/emotions'
import { formatDateKey, getEmotionColor, isDateRegistrable, isToday } from '@/lib/emotions'

type CalendarDayCellProps = {
  year: number
  month: number
  day: number
  log?: EmotionLog
  onSelect: (dateKey: string) => void
}

export function CalendarDayCell({ year, month, day, log, onSelect }: CalendarDayCellProps) {
  const dateKey = formatDateKey(year, month, day)
  const disabled = !isDateRegistrable(dateKey)
  const today = isToday(dateKey)

  const colorClass = log ? getEmotionColor(log.emotion) : 'bg-cream'
  const textClass = log && (log.emotion === 'triste' || log.emotion === 'muy_triste' || log.emotion === 'muy_feliz')
    ? 'text-white'
    : 'text-earth-700'

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(dateKey)}
      className={`flex aspect-square items-center justify-center rounded-xl text-sm font-medium transition ${colorClass} ${textClass} ${
        disabled
          ? 'cursor-not-allowed opacity-40'
          : 'hover:ring-2 hover:ring-rose-300 hover:ring-offset-1'
      } ${today ? 'ring-2 ring-earth-800 ring-offset-2' : ''}`}
      aria-label={dateKey}
    >
      {day}
    </button>
  )
}
