'use client'

import { useLocale } from '@/components/providers/LocaleProvider'

export function LangToggle() {
  const { lang, setLang } = useLocale()

  return (
    <div className="flex rounded-full border border-earth-200/80 bg-white p-0.5 shadow-sm">
      <button
        type="button"
        onClick={() => setLang('es')}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
          lang === 'es'
            ? 'bg-earth-800 text-white'
            : 'text-earth-600 hover:text-earth-900'
        }`}
        aria-pressed={lang === 'es'}
      >
        ES
      </button>
      <button
        type="button"
        onClick={() => setLang('en')}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
          lang === 'en'
            ? 'bg-earth-800 text-white'
            : 'text-earth-600 hover:text-earth-900'
        }`}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
    </div>
  )
}
