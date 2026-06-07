'use client'

import type { Lang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n'
import { formatTime } from '@/lib/format-time'

type MusicPlayerControlsProps = {
  lang: Lang
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  onTogglePlay: () => void
  onVolumeChange: (volume: number) => void
  onSeek: (seconds: number) => void
}

export function MusicPlayerControls({
  lang,
  isPlaying,
  currentTime,
  duration,
  volume,
  onTogglePlay,
  onVolumeChange,
  onSeek,
}: MusicPlayerControlsProps) {
  const copy = getTranslations(lang).melodias
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0

  function handleProgressClick(event: React.MouseEvent<HTMLDivElement>) {
    if (duration <= 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width))
    onSeek(ratio * duration)
  }

  return (
    <div className="border-t border-earth-100 bg-rose-50/60 px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onTogglePlay}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-earth-900 text-white transition hover:bg-earth-700"
          aria-label={isPlaying ? copy.pause : copy.listen}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isPlaying && (
              <span className="inline-flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-rose-500">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
                {copy.playing}
              </span>
            )}
          </div>

          <div
            role="slider"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            tabIndex={0}
            onClick={handleProgressClick}
            onKeyDown={(e) => {
              if (duration <= 0) return
              if (e.key === 'ArrowRight') onSeek(Math.min(duration, currentTime + 5))
              if (e.key === 'ArrowLeft') onSeek(Math.max(0, currentTime - 5))
            }}
            className="mt-2 h-1.5 cursor-pointer rounded-full bg-earth-200"
          >
            <div
              className="h-full rounded-full bg-rose-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-1 flex justify-between text-[0.65rem] text-earth-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <VolumeIcon className="h-4 w-4 shrink-0 text-earth-500" />
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="h-1.5 w-full cursor-pointer accent-rose-400"
          aria-label={copy.volume}
        />
        <span className="w-8 text-right text-[0.65rem] text-earth-500">{volume}</span>
      </div>
    </div>
  )
}

function PlayIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
    </svg>
  )
}

function VolumeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396.234-.847.96-1.354 1.838-1.354h2.24z" />
    </svg>
  )
}
