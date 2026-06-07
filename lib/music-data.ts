import musicJson from '@/data/music.json'
import type { MusicTrack } from '@/lib/music'

export function getMusicTracks(): MusicTrack[] {
  return (musicJson as MusicTrack[]).sort((a, b) => a.sort_order - b.sort_order)
}
