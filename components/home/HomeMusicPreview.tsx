'use client'

import Image from 'next/image'
import Link from 'next/link'
import { SectionHeading } from '@/components/common/SectionHeading'
import { HomeSectionLink } from '@/components/home/HomeSectionLink'
import { useLocale } from '@/components/providers/LocaleProvider'
import { getTranslations } from '@/lib/i18n'
import { getMusicTracks } from '@/lib/music-data'
import {
  getMusicDescription,
  getMusicTags,
  getMusicThumbnail,
  getMusicTitle,
} from '@/lib/music'

export function HomeMusicPreview() {
  const { lang } = useLocale()
  const copy = getTranslations(lang).home
  const tracks = getMusicTracks().slice(0, 3)

  return (
    <section className="px-6 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          eyebrow={copy.musicEyebrow}
          title={copy.musicTitle}
          description={copy.musicDescription}
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {tracks.map((track) => {
            const title = getMusicTitle(track, lang)
            const description = getMusicDescription(track, lang)
            const tags = getMusicTags(track, lang)
            const thumbnail = getMusicThumbnail(track)

            return (
              <article
                key={track.id}
                className="overflow-hidden rounded-2xl border border-earth-100 bg-white shadow-card"
              >
                <div className="relative aspect-video bg-[var(--color-primary-light)]">
                  {thumbnail ? (
                    <Image
                      src={thumbnail}
                      alt={title}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-earth-500">
                      {title}
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap gap-2">
                    {tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-rose-50 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-rose-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="mt-3 font-display text-2xl text-earth-900">{title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-earth-600">
                    {description}
                  </p>
                  <Link
                    href="/melodias"
                    className="mt-4 inline-block text-sm font-semibold text-rose-500 hover:underline"
                  >
                    {copy.musicListen}
                  </Link>
                </div>
              </article>
            )
          })}
        </div>

        <HomeSectionLink href="/melodias" label={copy.musicLink} />
      </div>
    </section>
  )
}
