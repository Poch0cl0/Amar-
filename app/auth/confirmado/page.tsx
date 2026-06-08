'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useLocale } from '@/components/providers/LocaleProvider'
import { getTranslations } from '@/lib/i18n'
import { createSupabaseClient } from '@/lib/supabase'

export default function ConfirmadoPage() {
  const router = useRouter()
  const { lang } = useLocale()
  const copy = getTranslations(lang).login

  useEffect(() => {
    let timer: number | undefined
    const supabase = createSupabaseClient()

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        timer = window.setTimeout(() => {
          router.replace('/')
        }, 5000)
      }
    })

    return () => {
      if (timer) window.clearTimeout(timer)
    }
  }, [router])

  return (
    <section className="px-6 py-16 sm:py-20 lg:px-8">
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mb-8 flex flex-col items-center">
          <Image
            src="/logo-amara.png"
            alt="Amará"
            width={1536}
            height={1024}
            unoptimized
            className="h-20 w-auto object-contain sm:h-24"
            priority
          />
          <p className="mt-1 text-[0.65rem] font-semibold tracking-[0.35em] text-earth-500">
            {copy.serenity}
          </p>
        </div>

        <div className="rounded-3xl border border-sage-200 bg-white px-6 py-10 shadow-card sm:px-8">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-sage-100 text-3xl">
            ✓
          </div>
          <h1 className="font-display text-3xl text-earth-900">{copy.emailConfirmedTitle}</h1>
          <p className="mt-4 text-sm leading-relaxed text-earth-600">
            {copy.emailConfirmedDesc}
          </p>
          <p className="mt-3 text-xs text-earth-500">{copy.emailConfirmedHint}</p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/login"
              className="rounded-full bg-[#C8A0A0] px-6 py-3.5 text-sm font-semibold text-earth-900 transition hover:bg-[#b89090]"
            >
              {copy.emailConfirmedLogin}
            </Link>
            <Link
              href="/"
              className="rounded-full border border-earth-200 px-6 py-3.5 text-sm font-semibold text-earth-700 transition hover:bg-sand-50"
            >
              {copy.emailConfirmedHome}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
