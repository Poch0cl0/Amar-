'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const PLAYER_ELEMENT_ID = 'amara-yt-player'

type YouTubePlayer = {
  playVideo: () => void
  pauseVideo: () => void
  stopVideo: () => void
  loadVideoById: (videoId: string) => void
  setVolume: (volume: number) => void
  getVolume: () => number
  getCurrentTime: () => number
  getDuration: () => number
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  destroy: () => void
}

type YouTubeNamespace = {
  Player: new (
    elementId: string,
    options: {
      height?: string
      width?: string
      playerVars?: Record<string, number | string>
      events?: {
        onReady?: () => void
        onStateChange?: (event: { data: number }) => void
      }
    },
  ) => YouTubePlayer
  PlayerState: {
    PLAYING: number
    PAUSED: number
    ENDED: number
  }
}

declare global {
  interface Window {
    YT?: YouTubeNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve()

  return new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve()
    }

    if (!document.querySelector('script[data-amara-yt-api]')) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      script.dataset.amaraYtApi = 'true'
      document.body.appendChild(script)
    }
  })
}

export function useYouTubePlayer() {
  const playerRef = useRef<YouTubePlayer | null>(null)
  const [ready, setReady] = useState(false)
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(70)

  useEffect(() => {
    let cancelled = false

    loadYouTubeApi().then(() => {
      if (cancelled || !window.YT?.Player) return
      if (playerRef.current) return

      playerRef.current = new window.YT.Player(PLAYER_ELEMENT_ID, {
        height: '1',
        width: '1',
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: () => {
            if (!cancelled) {
              playerRef.current?.setVolume(70)
              setReady(true)
            }
          },
          onStateChange: (event) => {
            const state = window.YT?.PlayerState
            if (!state) return

            if (event.data === state.PLAYING) setIsPlaying(true)
            if (event.data === state.PAUSED) setIsPlaying(false)
            if (event.data === state.ENDED) {
              setIsPlaying(false)
              setCurrentTime(0)
            }
          },
        },
      })
    })

    return () => {
      cancelled = true
      playerRef.current?.destroy()
      playerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isPlaying || !ready) return

    const interval = window.setInterval(() => {
      const player = playerRef.current
      if (!player) return

      const nextTime = player.getCurrentTime()
      const nextDuration = player.getDuration()

      setCurrentTime(nextTime)
      if (Number.isFinite(nextDuration) && nextDuration > 0) {
        setDuration(nextDuration)
      }
    }, 400)

    return () => window.clearInterval(interval)
  }, [isPlaying, ready])

  const play = useCallback(
    (videoId: string) => {
      const player = playerRef.current
      if (!player || !ready) return

      if (activeVideoId !== videoId) {
        player.loadVideoById(videoId)
        setActiveVideoId(videoId)
        setCurrentTime(0)
        setDuration(0)
      } else {
        player.playVideo()
      }
    },
    [activeVideoId, ready],
  )

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo()
  }, [])

  const togglePlay = useCallback(
    (videoId: string) => {
      if (activeVideoId === videoId && isPlaying) {
        pause()
        return
      }
      play(videoId)
    },
    [activeVideoId, isPlaying, pause, play],
  )

  const stop = useCallback(() => {
    playerRef.current?.stopVideo()
    setActiveVideoId(null)
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
  }, [])

  const changeVolume = useCallback((nextVolume: number) => {
    const clamped = Math.max(0, Math.min(100, nextVolume))
    setVolume(clamped)
    playerRef.current?.setVolume(clamped)
  }, [])

  const seek = useCallback((seconds: number) => {
    if (!playerRef.current) return
    playerRef.current.seekTo(seconds, true)
    setCurrentTime(seconds)
  }, [])

  return {
    ready,
    activeVideoId,
    isPlaying,
    currentTime,
    duration,
    volume,
    play,
    pause,
    togglePlay,
    stop,
    changeVolume,
    seek,
  }
}

export { PLAYER_ELEMENT_ID }
