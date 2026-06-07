'use client'

import { useState } from 'react'
import { useLandingContent } from '@/hooks/useLandingContent'

export function DailyPhraseDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const { dailyPhrase } = useLandingContent()

  return (
    <div>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full border border-earth-200 bg-white px-4 py-2 text-sm font-semibold text-earth-800 transition hover:border-earth-300 hover:bg-earth-100"
        onClick={() => setIsOpen(true)}
      >
        <span className="text-base">✦</span>
        Frase del dia
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-earth-950/40 px-6"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-xl rounded-[2rem] bg-white p-8 shadow-soft"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="daily-phrase-title"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sage-700">
              Frase del dia
            </p>
            <p
              id="daily-phrase-title"
              className="mt-6 font-display text-3xl leading-tight text-earth-900 md:text-4xl"
            >
              &ldquo;{dailyPhrase.text}&rdquo;
            </p>
            <p className="mt-4 text-sm text-earth-500">{dailyPhrase.author}</p>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                className="rounded-full bg-earth-900 px-5 py-2.5 text-sm font-semibold text-white"
                onClick={() => setIsOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
