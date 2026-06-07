'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChatSuggestions } from '@/components/chat/ChatSuggestions'
import { loginPath } from '@/lib/auth-redirect'
import type { Lang } from '@/lib/i18n'
import { getTranslations } from '@/lib/i18n'

type ChatLoginGateProps = {
  lang: Lang
}

export function ChatLoginGate({ lang }: ChatLoginGateProps) {
  const pathname = usePathname()
  const copy = getTranslations(lang).chat

  return (
    <div className="flex h-full flex-col p-4">
      <p className="text-center text-sm leading-relaxed text-[var(--color-text)]">
        {copy.loginRequired}
      </p>
      <p className="mt-2 text-center text-xs text-earth-500">{copy.loginHint}</p>

      <div className="mt-4 flex flex-col gap-2">
        <Link
          href={loginPath(pathname)}
          className="rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:opacity-90"
        >
          {copy.signIn}
        </Link>
        <Link
          href={loginPath(pathname)}
          className="rounded-xl border border-earth-200 px-4 py-2.5 text-center text-sm font-semibold text-earth-700 transition hover:bg-sand-50"
        >
          {copy.createAccount}
        </Link>
      </div>

      <div className="mt-5 border-t border-earth-100 pt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-earth-500">
          {copy.suggestionsTitle}
        </p>
        <ChatSuggestions lang={lang} disabled />
      </div>
    </div>
  )
}
