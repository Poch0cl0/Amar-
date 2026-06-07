'use client'

import { EmotionIcon } from '@/components/progreso/EmotionIcon'
import type { Lang } from '@/lib/i18n'
import type { EmotionType } from '@/lib/emotions'
import { PICKER_EMOTIONS, getEmotionLabel } from '@/lib/emotions'

type EmotionPickerProps = {
  value: EmotionType | null
  onChange: (emotion: EmotionType) => void
  lang: Lang
}

export function EmotionPicker({ value, onChange, lang }: EmotionPickerProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {PICKER_EMOTIONS.map((emotion) => {
        const selected = value === emotion
        return (
          <button
            key={emotion}
            type="button"
            onClick={() => onChange(emotion)}
            className={`flex flex-col items-center gap-1.5 rounded-2xl px-2 py-2 transition ${
              selected
                ? 'ring-2 ring-rose-400 ring-offset-2'
                : 'opacity-80 hover:opacity-100'
            }`}
            aria-pressed={selected}
          >
            <EmotionIcon emotion={emotion} className="h-12 w-12" />
            <span className="max-w-[4.5rem] text-center text-[0.65rem] font-medium leading-tight text-earth-600">
              {getEmotionLabel(emotion, lang)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
