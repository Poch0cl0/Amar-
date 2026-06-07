import type { Melody } from '@/lib/landing-content'

type MelodyCardProps = {
  melody: Melody
}

export function MelodyCard({ melody }: MelodyCardProps) {
  return (
    <article className="group rounded-[2rem] border border-earth-200/80 bg-white/90 p-6 shadow-card transition hover:-translate-y-1 hover:shadow-soft">
      <div
        className={`mb-6 inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${melody.accent}`}
      >
        {melody.category}
      </div>
      <h3 className="font-display text-2xl text-earth-900">{melody.title}</h3>
      <p className="mt-3 text-sm leading-7 text-earth-600">{melody.description}</p>
      <div className="mt-6 flex items-center justify-between text-sm text-earth-500">
        <span>{melody.duration}</span>
        <button
          type="button"
          className="rounded-full bg-earth-900 px-4 py-2 font-semibold text-white transition hover:bg-earth-700"
        >
          Escuchar
        </button>
      </div>
    </article>
  )
}
