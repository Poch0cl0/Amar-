import type { Lang } from '@/lib/i18n'
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from '@/lib/youtube'

export type MusicTrack = {
  id: number
  youtube_url: string
  title_es: string
  title_en: string
  description_es: string
  description_en: string
  tags_es: string[]
  tags_en: string[]
  thumbnail_url?: string | null
  sort_order: number
}

export function getMusicTitle(track: MusicTrack, lang: Lang): string {
  return lang === 'en' ? track.title_en : track.title_es
}

export function getMusicDescription(track: MusicTrack, lang: Lang): string {
  return lang === 'en' ? track.description_en : track.description_es
}

export function getMusicTags(track: MusicTrack, lang: Lang): string[] {
  const tags = lang === 'en' ? track.tags_en : track.tags_es
  return tags.length > 0 ? tags : lang === 'en' ? track.tags_es : track.tags_en
}

export function getMusicThumbnail(track: MusicTrack): string {
  if (track.thumbnail_url?.trim()) return track.thumbnail_url.trim()
  const videoId = extractYouTubeVideoId(track.youtube_url)
  return videoId ? getYouTubeThumbnailUrl(videoId) : ''
}

export function getMusicVideoId(track: MusicTrack): string | null {
  return extractYouTubeVideoId(track.youtube_url)
}

export function getYouTubeEmbedUrl(videoId: string, autoplay = true): string {
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    rel: '0',
    modestbranding: '1',
  })
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}
