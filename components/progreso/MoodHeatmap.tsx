'use client'

import type { Lang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n'
import type { EmotionLog } from '@/lib/emotions'
import { buildMonthLogsMap, formatDateKey, getHeatmapIntensityClass } from '@/lib/emotions'

type MoodHeatmapProps = {
  year: number
  month: number
  logs: EmotionLog[]
  lang: Lang
}

export function MoodHeatmap({ year, month, logs, lang }: MoodHeatmapProps) {
  const copy = getTranslations(lang).progreso
  const logsMap = buildMonthLogsMap(logs)
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1
    const dateKey = formatDateKey(year, month, day)
    const log = logsMap.get(dateKey)
    return {
      dateKey,
      day,
      intensityClass: getHeatmapIntensityClass(log?.mood_score),
    }
  })

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-earth-100 bg-white p-4 shadow-card sm:p-5">
      <h3 className="font-display text-lg text-earth-900">{copy.heatmapTitle}</h3>

      <div className="mt-4 grid min-w-0 grid-cols-7 gap-1 sm:gap-1.5">
        {cells.map((cell) => (
          <div
            key={cell.dateKey}
            title={`${cell.day}: ${cell.dateKey}`}
            className={`aspect-square rounded-md ${cell.intensityClass}`}
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-[0.65rem] text-earth-500">
        <span>{copy.lowIntensity}</span>
        <div className="flex gap-1">
          {['bg-rose-50', 'bg-rose-200', 'bg-rose-400', 'bg-earth-700'].map((color) => (
            <span key={color} className={`h-3 w-3 rounded-sm ${color}`} />
          ))}
        </div>
        <span>{copy.highIntensity}</span>
      </div>
    </div>
  )
}
