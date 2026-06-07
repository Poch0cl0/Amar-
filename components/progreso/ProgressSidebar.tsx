'use client'

import { EmotionSummaryBars } from '@/components/progreso/EmotionSummaryBars'
import { MoodHeatmap } from '@/components/progreso/MoodHeatmap'
import type { Lang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n'
import type { EmotionLog } from '@/lib/emotions'
import { computeSidebarStats, getMonthLabel, getSelectableMonthsForCurrentYear } from '@/lib/emotions'

type ProgressSidebarProps = {
  year: number
  month: number
  logs: EmotionLog[]
  lang: Lang
  onMonthChange: (year: number, month: number) => void
}

function formatCount(value: number, lang: Lang): string {
  return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'es-ES').format(value)
}

export function ProgressSidebar({
  year,
  month,
  logs,
  lang,
  onMonthChange,
}: ProgressSidebarProps) {
  const copy = getTranslations(lang).progreso
  const monthOptions = getSelectableMonthsForCurrentYear(lang)
  const currentYear = new Date().getFullYear()
  const sidebarStats = computeSidebarStats(logs)

  const statCards = [
    {
      label: copy.statsRegistered,
      value: formatCount(sidebarStats.registeredDays, lang),
      hint: copy.statsRegisteredHint,
      accent: '',
    },
    {
      label: copy.statsHappy,
      value: formatCount(sidebarStats.happyDays, lang),
      hint: copy.statsHappyHint,
      accent: 'border-b-2 border-sage-400',
    },
    {
      label: copy.statsAnxious,
      value: formatCount(sidebarStats.anxiousDays, lang),
      hint: copy.statsAnxiousHint,
      accent: 'border-b-2 border-rose-400',
    },
    {
      label: copy.statsMood,
      value: sidebarStats.avgIntensity,
      hint: copy.statsMoodHint,
      accent: '',
    },
  ]

  return (
    <aside className="space-y-5">
      <div className="rounded-2xl border border-earth-100 bg-white p-4 shadow-card">
        <label className="block space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-earth-500">
            {copy.monthSelector}
          </span>
          {year === currentYear && monthOptions.length > 0 ? (
            <select
              value={`${year}-${month}`}
              onChange={(e) => {
                const [y, m] = e.target.value.split('-').map(Number)
                onMonthChange(y, m)
              }}
              className="w-full rounded-xl border border-earth-200 bg-cream px-4 py-3 text-sm font-medium capitalize text-earth-800 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
            >
              {monthOptions.map((option) => (
                <option key={`${option.year}-${option.month}`} value={`${option.year}-${option.month}`}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <p className="rounded-xl border border-earth-200 bg-cream px-4 py-3 text-sm font-medium capitalize text-earth-800">
              {getMonthLabel(year, month, lang)}
            </p>
          )}
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border border-earth-100 bg-white p-4 shadow-card ${card.accent}`}
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-earth-500">
              {card.label}
            </p>
            <p className="mt-3 font-display text-[2.5rem] font-semibold leading-none tabular-nums tracking-tight text-earth-900">
              {card.value}
            </p>
            <p className="mt-2 text-sm font-medium text-earth-500">{card.hint}</p>
          </div>
        ))}
      </div>

      <MoodHeatmap year={year} month={month} logs={logs} lang={lang} />
      <EmotionSummaryBars logs={logs} lang={lang} />
    </aside>
  )
}
