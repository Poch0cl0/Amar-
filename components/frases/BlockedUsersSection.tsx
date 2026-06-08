'use client'

import { useLocale } from '@/components/providers/LocaleProvider'
import { getTranslations } from '@/lib/i18n'
import type { BlockedUser } from '@/lib/frases'

type BlockedUsersSectionProps = {
  users: BlockedUser[]
  loading: boolean
  unblockingId: string | null
  message: string
  showRpcHint: boolean
  onUnblock: (blockedId: string, email: string) => void
}

export function BlockedUsersSection({
  users,
  loading,
  unblockingId,
  message,
  showRpcHint,
  onUnblock,
}: BlockedUsersSectionProps) {
  const { lang } = useLocale()
  const copy = getTranslations(lang).frases

  return (
    <section>
      <div className="mb-8">
        <h2 className="font-display text-3xl text-earth-900">{copy.blockedTitle}</h2>
        <p className="mt-2 text-sm text-earth-500">{copy.blockedDesc}</p>
      </div>

      {message && (
        <p className="mb-4 rounded-xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-700">
          {message}
        </p>
      )}

      {showRpcHint && (
        <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs leading-6 text-earth-600">
          {copy.blockedRpcHint}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-earth-500">{copy.loadingBlocked}</p>
      ) : users.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-earth-200 bg-white/60 px-6 py-10 text-center text-sm text-earth-500">
          {copy.emptyBlocked}
        </p>
      ) : (
        <ul className="space-y-3">
          {users.map((blocked) => (
            <li
              key={blocked.blocked_id}
              className="flex flex-col gap-3 rounded-2xl border border-earth-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-earth-900">{blocked.email}</p>
                {blocked.display_name !== blocked.email && (
                  <p className="mt-0.5 truncate text-sm text-earth-500">{blocked.display_name}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onUnblock(blocked.blocked_id, blocked.email)}
                disabled={unblockingId === blocked.blocked_id}
                className="shrink-0 rounded-full border border-earth-300 px-4 py-2 text-sm font-semibold text-earth-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-60"
              >
                {unblockingId === blocked.blocked_id ? copy.unblocking : copy.unblock}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
