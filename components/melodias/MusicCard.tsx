'use client'

import type { Lang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n'
import type { MusicTrack } from '@/lib/music'
import {
  getMusicDescription,
  getMusicTags,
  getMusicThumbnail,
  getMusicTitle,
  getMusicVideoId,
} from '@/lib/music'
import { MusicPlayerControls } from '@/components/melodias/MusicPlayerControls'

type MusicCardProps = {
  track: MusicTrack
  lang: Lang
  isActive: boolean
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  onListen: () => void
  onTogglePlay: () => void
  onVolumeChange: (volume: number) => void
  onSeek: (seconds: number) => void
}

export function MusicCard({
  track,
  lang,
  isActive,
  isPlaying,
  currentTime,
  duration,
  volume,
  onListen,
  onTogglePlay,
  onVolumeChange,
  onSeek,
}: MusicCardProps) {
  const copy = getTranslations(lang).melodias
  const title = getMusicTitle(track, lang)
  const description = getMusicDescription(track, lang)
  const tags = getMusicTags(track, lang).slice(0, 3)
  const thumbnail = getMusicThumbnail(track)
  const videoId = getMusicVideoId(track)

  return (
    <article className="flex w-full flex-col self-start overflow-hidden rounded-2xl bg-white shadow-card transition hover:shadow-soft">
      <div className="relative h-[200px] w-full overflow-hidden bg-[var(--color-primary-light)]">
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-rose-400">
            <MusicIcon className="h-16 w-16" />
          </div>
        )}
      </div>

      {isActive && (
        <MusicPlayerControls
          lang={lang}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          onTogglePlay={onTogglePlay}
          onVolumeChange={onVolumeChange}
          onSeek={onSeek}
        />
      )}

      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={`${track.id}-${tag}`}
              className="rounded-full bg-rose-100 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-earth-700"
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 className="font-display text-2xl leading-snug text-earth-900">{title}</h3>

        <p className="line-clamp-3 text-sm leading-relaxed text-earth-600">{description}</p>

        {!isActive && (
          <button
            type="button"
            onClick={onListen}
            disabled={!videoId}
            className="mt-1 inline-flex w-fit rounded-full bg-earth-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-earth-700 disabled:opacity-50"
          >
            {copy.listen}
          </button>
        )}
      </div>
    </article>
  )
}

function MusicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-3.692-.77V6.553a2.25 2.25 0 011.632-2.163l1.32-.377a1.803 1.803 0 013.692.77V15.75" />
    </svg>
  )
}
