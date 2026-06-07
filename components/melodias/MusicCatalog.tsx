'use client'

import { useEffect, useMemo, useState } from 'react'
import { MusicCard } from '@/components/melodias/MusicCard'
import { PLAYER_ELEMENT_ID, useYouTubePlayer } from '@/components/melodias/useYouTubePlayer'
import { useLocale } from '@/components/providers/LocaleProvider'
import { getTranslations } from '@/lib/i18n'
import { getMusicTracks } from '@/lib/music-data'
import { getMusicVideoId } from '@/lib/music'

const PAGE_SIZE = 6

export function MusicCatalog() {
  const { lang } = useLocale()
  const copy = getTranslations(lang).melodias
  const tracks = getMusicTracks()
  const player = useYouTubePlayer()

  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(tracks.length / PAGE_SIZE))

  const pageTracks = useMemo(
    () => tracks.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [page, tracks],
  )

  const activeTrack = tracks.find(
    (track) => getMusicVideoId(track) === player.activeVideoId,
  )

  const activeTrackOnPage = pageTracks.some((track) => track.id === activeTrack?.id)

  const { stop, activeVideoId } = player

  useEffect(() => {
    if (activeVideoId && activeTrack && !activeTrackOnPage) {
      stop()
    }
  }, [activeVideoId, activeTrack?.id, activeTrackOnPage, stop])

  function handleListen(trackId: number, videoId: string | null) {
    if (!videoId) return
    player.play(videoId)
  }

  return (
    <>
      <div
        id={PLAYER_ELEMENT_ID}
        className="pointer-events-none fixed left-[-9999px] top-0 h-px w-px overflow-hidden opacity-0"
        aria-hidden
      />

      <div className="mt-12 grid grid-cols-1 items-start gap-8 md:grid-cols-2 lg:grid-cols-3">
        {pageTracks.map((track) => {
          const videoId = getMusicVideoId(track)
          const isActive = videoId !== null && player.activeVideoId === videoId

          return (
            <MusicCard
              key={track.id}
              track={track}
              lang={lang}
              isActive={isActive}
              isPlaying={isActive && player.isPlaying}
              currentTime={isActive ? player.currentTime : 0}
              duration={isActive ? player.duration : 0}
              volume={player.volume}
              onListen={() => handleListen(track.id, videoId)}
              onTogglePlay={() => {
                if (!videoId) return
                player.togglePlay(videoId)
              }}
              onVolumeChange={player.changeVolume}
              onSeek={player.seek}
            />
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(0, current - 1))}
            disabled={page === 0}
            className="rounded-full border border-earth-200 px-4 py-2 text-sm font-medium text-earth-700 transition hover:border-rose-300 hover:text-rose-500 disabled:opacity-40"
          >
            {copy.previous}
          </button>

          <span className="text-sm text-earth-600">
            {copy.page} {page + 1} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-full border border-earth-200 px-4 py-2 text-sm font-medium text-earth-700 transition hover:border-rose-300 hover:text-rose-500 disabled:opacity-40"
          >
            {copy.next}
          </button>
        </div>
      )}
    </>
  )
}
