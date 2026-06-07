'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { ProgressDashboard } from '@/components/progreso/ProgressDashboard'
import { ProgressGuestCTA } from '@/components/progreso/ProgressGuestCTA'
import { useLocale } from '@/components/providers/LocaleProvider'
import { getTranslations } from '@/lib/i18n'
import { createSupabaseClient } from '@/lib/supabase'

export function ProgresoPageContent() {
  const { lang } = useLocale()
  const copy = getTranslations(lang).progreso

  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseClient()

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setAuthReady(true)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setAuthReady(true)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const displayName =
    (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ||
    copy.defaultName

  return (
    <section className="bg-[linear-gradient(180deg,_#fdf8f8_0%,_#F9F8F4_50%,_#f6f0e8_100%)] px-6 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-400">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl text-earth-900 md:text-5xl">
            {user ? copy.greeting.replace('{name}', displayName) : copy.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-earth-600">
            {copy.description}
          </p>
        </header>

        <div className="mx-auto mt-8 max-w-2xl border-b border-rose-200/60" />

        <div className="mt-10">
          {!authReady ? (
            <p className="text-center text-sm text-earth-500">{copy.loading}</p>
          ) : user ? (
            <ProgressDashboard userId={user.id} lang={lang} />
          ) : (
            <ProgressGuestCTA />
          )}
        </div>
      </div>
    </section>
  )
}
