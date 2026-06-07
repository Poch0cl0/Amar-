'use client'

import { CalendarDayCell } from '@/components/progreso/CalendarDayCell'
import type { Lang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n'
import type { EmotionLog } from '@/lib/emotions'
import {
  LEGEND_ITEMS,
  buildMonthLogsMap,
  canGoToNextMonth,
  canGoToPrevMonth,
  getMonthLabel,
  getWeekdayLabels,
} from '@/lib/emotions'

type EmotionalCalendarProps = {
  year: number
  month: number
  logs: EmotionLog[]
  lang: Lang
  onPrevMonth: () => void
  onNextMonth: () => void
  onSelectDate: (dateKey: string) => void
}

export function EmotionalCalendar({
  year,
  month,
  logs,
  lang,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}: EmotionalCalendarProps) {
  const copy = getTranslations(lang).progreso
  const logsMap = buildMonthLogsMap(logs)
  const weekdays = getWeekdayLabels(lang)
  const monthLabel = getMonthLabel(year, month, lang)
  const prevEnabled = canGoToPrevMonth(year, month)
  const nextEnabled = canGoToNextMonth(year, month)

  const firstDayOfMonth = new Date(year, month, 1)
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  return (
    <div className="rounded-3xl border border-rose-100/80 bg-white p-6 shadow-card">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl text-earth-900">{copy.calendarTitle}</h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPrevMonth}
            disabled={!prevEnabled}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-earth-200 text-earth-600 transition hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={copy.prevMonth}
          >
            <ChevronLeft />
          </button>
          <span className="min-w-[8rem] text-center text-xs font-semibold capitalize text-earth-700 sm:text-sm">
            {monthLabel}
          </span>
          <button
            type="button"
            onClick={onNextMonth}
            disabled={!nextEnabled}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-earth-200 text-earth-600 transition hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={copy.nextMonth}
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-2">
        {weekdays.map((label) => (
          <div
            key={label}
            className="pb-1 text-center text-[0.65rem] font-semibold uppercase tracking-wide text-earth-400"
          >
            {label}
          </div>
        ))}

        {cells.map((day, index) =>
          day === null ? (
            <div key={`empty-${index}`} />
          ) : (
            <CalendarDayCell
              key={day}
              year={year}
              month={month}
              day={day}
              log={logsMap.get(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
              onSelect={onSelectDate}
            />
          ),
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-4 border-t border-earth-100 pt-5">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.key} className="flex items-center gap-2 text-xs text-earth-600">
            <span className={`h-3 w-3 rounded-full ${item.color}`} />
            <span>{copy.legend[item.key as keyof typeof copy.legend]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChevronLeft() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}
