'use client'

import { useState } from 'react'
import { EmotionPicker } from '@/components/progreso/EmotionPicker'
import { MoodIntensitySlider } from '@/components/progreso/MoodIntensitySlider'
import type { Lang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n'
import type { EmotionLog, EmotionType } from '@/lib/emotions'
import { PICKER_EMOTIONS, isDateRegistrable, parseDateKey, upsertEmotionLog } from '@/lib/emotions'

type EmotionLogModalProps = {
  userId: string
  dateKey: string
  existingLog?: EmotionLog
  lang: Lang
  onClose: () => void
  onSaved: () => void
}

export function EmotionLogModal({
  userId,
  dateKey,
  existingLog,
  lang,
  onClose,
  onSaved,
}: EmotionLogModalProps) {
  const copy = getTranslations(lang).progreso

  const [emotion, setEmotion] = useState<EmotionType | null>(
    existingLog?.emotion && PICKER_EMOTIONS.includes(existingLog.emotion)
      ? existingLog.emotion
      : PICKER_EMOTIONS[1],
  )
  const [moodScore, setMoodScore] = useState(existingLog?.mood_score ?? 5)
  const [note, setNote] = useState(existingLog?.note ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const formattedDate = parseDateKey(dateKey).toLocaleDateString(
    lang === 'en' ? 'en-US' : 'es-ES',
    { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!emotion) {
      setError(copy.selectEmotion)
      return
    }

    if (!isDateRegistrable(dateKey)) {
      setError(copy.dateNotAllowed)
      return
    }

    setLoading(true)
    try {
      await upsertEmotionLog({
        user_id: userId,
        log_date: dateKey,
        emotion,
        mood_score: moodScore,
        note: note.trim() || null,
      })
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.saveError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-earth-950/40 px-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-rose-200/60 bg-white p-8 shadow-soft"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="emotion-log-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="emotion-log-title" className="font-display text-2xl text-earth-900">
              {copy.modalTitle}
            </h2>
            <p className="mt-1 text-sm capitalize text-earth-500">{formattedDate}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-earth-400 transition hover:bg-sand-50 hover:text-earth-700"
            aria-label={copy.close}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-earth-500">
              {copy.selectEmotionLabel}
            </p>
            <div className="mt-4">
              <EmotionPicker value={emotion} onChange={setEmotion} lang={lang} />
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-earth-500">
              {copy.intensityLabel}
            </p>
            <div className="mt-4">
              <MoodIntensitySlider
                value={moodScore}
                onChange={setMoodScore}
                subtleLabel={copy.subtle}
                intenseLabel={copy.intense}
              />
            </div>
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-earth-500">
              {copy.notesLabel}
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={copy.notesPlaceholder}
              rows={3}
              className="w-full resize-none rounded-xl border border-earth-200 bg-rose-50/50 px-4 py-3 text-sm text-earth-900 placeholder:text-earth-300 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
            />
          </label>

          {error && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-rose-300 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:opacity-60"
          >
            {loading ? copy.saving : copy.saveProgress}
          </button>
        </form>
      </div>
    </div>
  )
}
