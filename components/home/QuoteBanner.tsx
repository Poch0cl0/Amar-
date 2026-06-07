import { getLandingContent } from '@/lib/landing-content'

export function QuoteBanner() {
  const { dailyPhrase } = getLandingContent()

  return (
    <section className="px-6 py-20 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-[2.75rem] bg-earth-900 px-8 py-14 text-center shadow-soft md:px-16">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sand-200">
          Inspiracion diaria
        </p>
        <p className="mt-6 font-display text-4xl italic leading-tight text-white md:text-5xl">
          &ldquo;{dailyPhrase.text}&rdquo;
        </p>
        <p className="mt-5 text-sm uppercase tracking-[0.3em] text-sand-300">
          {dailyPhrase.author}
        </p>
      </div>
    </section>
  )
}
