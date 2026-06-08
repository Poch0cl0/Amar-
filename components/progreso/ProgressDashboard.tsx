'use client'

import { useCallback, useEffect, useState } from 'react'
import { EmotionalCalendar } from '@/components/progreso/EmotionalCalendar'
import { EmotionLogModal } from '@/components/progreso/EmotionLogModal'
import { ProgressSidebar } from '@/components/progreso/ProgressSidebar'
import type { Lang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n'
import type { EmotionLog } from '@/lib/emotions'
import {
  buildMonthLogsMap,
  canGoToNextMonth,
  canGoToPrevMonth,
  fetchLogsForMonth,
  getInitialViewMonth,
  isDateRegistrable,
} from '@/lib/emotions'

type ProgressDashboardProps = {
  userId: string
  lang: Lang
}

export function ProgressDashboard({ userId, lang }: ProgressDashboardProps) {
  const copy = getTranslations(lang).progreso
  const initialView = getInitialViewMonth()

  const [year, setYear] = useState(initialView.year)
  const [month, setMonth] = useState(initialView.month)
  const [logs, setLogs] = useState<EmotionLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const monthLogs = await fetchLogsForMonth(userId, year, month)
      setLogs(monthLogs)
    } catch (err) {
      const message = err instanceof Error ? err.message : copy.loadError
      setError(
        message.includes('permission denied')
          ? `${copy.loadError} ${copy.permissionHint}`
          : message,
      )
    } finally {
      setLoading(false)
    }
  }, [userId, year, month, copy.loadError])

  useEffect(() => {
    loadData()
  }, [loadData])

  function handlePrevMonth() {
    if (!canGoToPrevMonth(year, month)) return
    if (month === 0) {
      setYear((y) => y - 1)
      setMonth(11)
    } else {
      setMonth((m) => m - 1)
    }
  }

  function handleNextMonth() {
    if (!canGoToNextMonth(year, month)) return
    if (month === 11) {
      setYear((y) => y + 1)
      setMonth(0)
    } else {
      setMonth((m) => m + 1)
    }
  }

  function handleSelectDate(dateKey: string) {
    if (!isDateRegistrable(dateKey)) return
    setSelectedDate(dateKey)
    setModalOpen(true)
  }

  function handleMonthChange(newYear: number, newMonth: number) {
    setYear(newYear)
    setMonth(newMonth)
  }

  const logsMap = buildMonthLogsMap(logs)
  const existingLog = selectedDate ? logsMap.get(selectedDate) : undefined

  return (
    <>
      {loading && (
        <p className="mb-6 text-center text-sm text-earth-500">{copy.loading}</p>
      )}

      {error && (
        <p className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm text-rose-500">
          {error}
        </p>
      )}

      <div className="grid min-w-0 max-w-full grid-cols-1 gap-8 overflow-hidden lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
        <EmotionalCalendar
          year={year}
          month={month}
          logs={logs}
          lang={lang}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onSelectDate={handleSelectDate}
        />

        <ProgressSidebar
          year={year}
          month={month}
          logs={logs}
          lang={lang}
          onMonthChange={handleMonthChange}
        />
      </div>

      {modalOpen && selectedDate && (
        <EmotionLogModal
          userId={userId}
          dateKey={selectedDate}
          existingLog={existingLog}
          lang={lang}
          onClose={() => setModalOpen(false)}
          onSaved={loadData}
        />
      )}
    </>
  )
}
