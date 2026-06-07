export type YouTubeMetadata = {
  videoId: string
  title: string
  description: string
  thumbnailUrl: string
  tags: string[]
  watchUrl: string
}

export function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url.trim())

    if (parsed.hostname === 'youtu.be') {
      return parsed.pathname.slice(1).split('/')[0] || null
    }

    if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/live/')) {
        return parsed.pathname.split('/')[2] || null
      }
      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/')[2] || null
      }
      const v = parsed.searchParams.get('v')
      if (v) return v
    }
  } catch {
    return null
  }

  return null
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

export function getYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`
}

export function normalizeYouTubeWatchUrl(url: string): string | null {
  const videoId = extractYouTubeVideoId(url)
  if (!videoId) return null
  return getYouTubeWatchUrl(videoId)
}
