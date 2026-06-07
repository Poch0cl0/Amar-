'use client'

import Link from 'next/link'
import { useLocale } from '@/components/providers/LocaleProvider'
import { getTranslations } from '@/lib/i18n'
import { getExercises } from '@/lib/exercises-data'
import { getMusicTracks } from '@/lib/music-data'
import { getProducts } from '@/lib/products-data'

export function HeroSection() {
  const { lang } = useLocale()
  const copy = getTranslations(lang).home

  const metrics = [
    { value: String(getProducts().length), label: copy.metricProducts },
    { value: String(getMusicTracks().length), label: copy.metricMelodies },
    { value: String(getExercises().length), label: copy.metricExercises },
  ]

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,_#fdf8f8_0%,_#F9F8F4_60%,_transparent_100%)] px-6 pb-16 pt-16 lg:px-8 lg:pt-20">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle,_rgba(214,167,138,0.25),_transparent_60%)]" />
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-8">
          <div className="inline-flex rounded-full border border-sage-200 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-sage-700">
            {copy.heroEyebrow}
          </div>

          <div className="space-y-6">
            <h1 className="font-display text-5xl leading-none text-earth-950 sm:text-6xl lg:text-7xl">
              {copy.heroTitle}
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-earth-600">{copy.heroDescription}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/productos"
              className="rounded-full bg-earth-900 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-earth-800"
            >
              {copy.ctaProducts}
            </Link>
            <Link
              href="/melodias"
              className="rounded-full border border-earth-300 bg-white px-6 py-3 text-sm font-semibold text-earth-800 transition hover:border-rose-300"
            >
              {copy.ctaMelodies}
            </Link>
            <Link
              href="/ejercicios"
              className="rounded-full border border-earth-300 bg-white px-6 py-3 text-sm font-semibold text-earth-800 transition hover:border-rose-300"
            >
              {copy.ctaExercises}
            </Link>
            <Link
              href="/frases"
              className="rounded-full border border-rose-200 bg-rose-50 px-6 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
            >
              {copy.ctaPhrases}
            </Link>
          </div>

          <div className="grid gap-4 pt-2 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-[1.75rem] border border-earth-200/80 bg-white/80 p-5 shadow-card"
              >
                <p className="font-display text-3xl text-earth-900">{metric.value}</p>
                <p className="mt-2 text-sm leading-6 text-earth-600">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="overflow-hidden rounded-[2.5rem] border border-earth-100 bg-white p-3 shadow-soft">
            <img
              src="/logo-amara.png"
              alt="Amará"
              className="h-auto w-full rounded-[2rem] object-contain p-8"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
