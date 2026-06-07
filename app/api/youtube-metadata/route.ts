import { NextResponse } from 'next/server'
import {
  extractYouTubeVideoId,
  getYouTubeThumbnailUrl,
  getYouTubeWatchUrl,
  type YouTubeMetadata,
} from '@/lib/youtube'

type OEmbedResponse = {
  title?: string
  author_name?: string
  thumbnail_url?: string
}

async function fetchViaDataApi(videoId: string, apiKey: string): Promise<YouTubeMetadata | null> {
  const endpoint = new URL('https://www.googleapis.com/youtube/v3/videos')
  endpoint.searchParams.set('part', 'snippet')
  endpoint.searchParams.set('id', videoId)
  endpoint.searchParams.set('key', apiKey)

  const res = await fetch(endpoint.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) return null

  const data = (await res.json()) as {
    items?: Array<{
      snippet?: {
        title?: string
        description?: string
        tags?: string[]
        thumbnails?: { high?: { url?: string }; medium?: { url?: string } }
      }
    }>
  }

  const snippet = data.items?.[0]?.snippet
  if (!snippet?.title) return null

  return {
    videoId,
    title: snippet.title,
    description: snippet.description?.trim() || snippet.title,
    thumbnailUrl:
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.medium?.url ||
      getYouTubeThumbnailUrl(videoId),
    tags: (snippet.tags ?? []).slice(0, 4),
    watchUrl: getYouTubeWatchUrl(videoId),
  }
}

async function fetchViaOEmbed(watchUrl: string, videoId: string): Promise<YouTubeMetadata> {
  const endpoint = new URL('https://www.youtube.com/oembed')
  endpoint.searchParams.set('url', watchUrl)
  endpoint.searchParams.set('format', 'json')

  const res = await fetch(endpoint.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) {
    return {
      videoId,
      title: 'Música relajante',
      description: '',
      thumbnailUrl: getYouTubeThumbnailUrl(videoId),
      tags: [],
      watchUrl,
    }
  }

  const data = (await res.json()) as OEmbedResponse
  const title = data.title?.trim() || 'Música relajante'

  return {
    videoId,
    title,
    description: title,
    thumbnailUrl: data.thumbnail_url || getYouTubeThumbnailUrl(videoId),
    tags: data.author_name ? [data.author_name] : [],
    watchUrl,
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { urls?: string[] }
    const urls = body.urls ?? []

    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'Se requiere un arreglo urls.' }, { status: 400 })
    }

    const apiKey = process.env.YOUTUBE_API_KEY
    const results: Record<string, YouTubeMetadata> = {}

    await Promise.all(
      urls.map(async (rawUrl) => {
        const videoId = extractYouTubeVideoId(rawUrl)
        if (!videoId) return

        const watchUrl = getYouTubeWatchUrl(videoId)

        if (apiKey) {
          const fromApi = await fetchViaDataApi(videoId, apiKey)
          if (fromApi) {
            results[videoId] = fromApi
            return
          }
        }

        results[videoId] = await fetchViaOEmbed(watchUrl, videoId)
      }),
    )

    return NextResponse.json({ videos: results })
  } catch {
    return NextResponse.json({ error: 'Error al obtener metadatos de YouTube.' }, { status: 500 })
  }
}
