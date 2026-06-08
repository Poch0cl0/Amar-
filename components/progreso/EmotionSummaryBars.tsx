'use client'

import type { Lang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n'
import type { EmotionLog } from '@/lib/emotions'
import { computeEmotionPercentages } from '@/lib/emotions'

type EmotionSummaryBarsProps = {
  logs: EmotionLog[]
  lang: Lang
}

const BAR_COLORS: Record<string, string> = {
  happy: 'bg-sage-500',
  anxious: 'bg-rose-400',
  sad: 'bg-earth-500',
  calm: 'bg-rose-200',
}

export function EmotionSummaryBars({ logs, lang }: EmotionSummaryBarsProps) {
  const copy = getTranslations(lang).progreso
  const percentages = computeEmotionPercentages(logs)

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-earth-100 bg-white p-4 shadow-card sm:p-5">
      <h3 className="font-display text-lg text-earth-900">{copy.summaryTitle}</h3>

      <div className="mt-5 space-y-4">
        {percentages.map(({ group, percent }) => (
          <div key={group}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-earth-700">
                {copy.summaryGroups[group as keyof typeof copy.summaryGroups]}
              </span>
              <span className="font-semibold text-earth-800">{percent}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-earth-100">
              <div
                className={`h-full rounded-full transition-all ${BAR_COLORS[group]}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
