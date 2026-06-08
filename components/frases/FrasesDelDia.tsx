'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { loginPath } from '@/lib/auth-redirect'
import type { User } from '@supabase/supabase-js'
import { BlockedUsersSection } from '@/components/frases/BlockedUsersSection'
import { CreatePhraseForm } from '@/components/frases/CreatePhraseForm'
import { SharePhraseDialog } from '@/components/frases/SharePhraseDialog'
import { SharedPhraseCard } from '@/components/frases/SharedPhraseCard'
import { UserPhraseCard } from '@/components/frases/UserPhraseCard'
import { useLocale } from '@/components/providers/LocaleProvider'
import { getTranslations } from '@/lib/i18n'
import {
  blockUserAndRemoveShares,
  getBlockedSenderIds,
  getBlockedUsers,
  getCategoryLabel,
  unblockUser,
  type BlockedUser,
  type SharedPhrase,
  type SystemPhrase,
  type UserPhrase,
} from '@/lib/frases'
import { createSupabaseClient } from '@/lib/supabase'

const NO_PHRASES_ERROR = '__NO_PHRASES__'

export function FrasesDelDia() {
  const pathname = usePathname()
  const { lang } = useLocale()
  const copy = getTranslations(lang).frases

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPhrase, setCurrentPhrase] = useState<SystemPhrase | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [myPhrases, setMyPhrases] = useState<UserPhrase[]>([])
  const [sharedPhrases, setSharedPhrases] = useState<SharedPhrase[]>([])
  const [loadingUserPhrases, setLoadingUserPhrases] = useState(false)

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [phraseToShare, setPhraseToShare] = useState<UserPhrase | null>(null)
  const [phrasesRefreshKey, setPhrasesRefreshKey] = useState(0)
  const [blockingSenderId, setBlockingSenderId] = useState<string | null>(null)
  const [blockMessage, setBlockMessage] = useState('')
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [loadingBlockedUsers, setLoadingBlockedUsers] = useState(false)
  const [unblockingId, setUnblockingId] = useState<string | null>(null)
  const [unblockMessage, setUnblockMessage] = useState('')
  const [blockedRpcMissing, setBlockedRpcMissing] = useState(false)

  const userId = user?.id ?? null
  const fetchIdRef = useRef(0)

  const authorName =
    (user?.user_metadata?.full_name as string | undefined)?.trim() || 'Tú'

  const refreshUserPhrases = useCallback(() => {
    setPhrasesRefreshKey((k) => k + 1)
  }, [])

  async function handleBlockSender(senderId: string, senderName: string) {
    if (!userId) return

    setBlockingSenderId(senderId)
    setBlockMessage('')

    try {
      await blockUserAndRemoveShares(userId, senderId)
      setSharedPhrases((current) => current.filter((phrase) => phrase.sender_id !== senderId))
      setBlockMessage(
        getTranslations(lang).frases.blockSuccess.replace('{name}', senderName),
      )
      setPhrasesRefreshKey((k) => k + 1)
    } catch (err) {
      const message =
        err instanceof Error &&
        (err.message === 'BLOCKED_USERS_TABLE_MISSING' ||
          err.message === 'BLOCKED_USERS_PERMISSION_DENIED')
          ? getTranslations(lang).frases.blockTableMissing
          : getTranslations(lang).frases.blockError
      setBlockMessage(message)
    } finally {
      setBlockingSenderId(null)
    }
  }

  async function handleUnblock(blockedId: string, email: string) {
    if (!userId) return

    setUnblockingId(blockedId)
    setUnblockMessage('')

    try {
      await unblockUser(userId, blockedId)
      setBlockedUsers((current) => current.filter((user) => user.blocked_id !== blockedId))
      setUnblockMessage(
        getTranslations(lang).frases.unblockSuccess.replace('{email}', email),
      )
      setPhrasesRefreshKey((k) => k + 1)
    } catch {
      setUnblockMessage(getTranslations(lang).frases.unblockError)
    } finally {
      setUnblockingId(null)
    }
  }

  useEffect(() => {
    const supabase = createSupabaseClient()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => { listener.subscription.unsubscribe() }
  }, [])

  const loadDailyPhrase = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createSupabaseClient()
      const { data, error: rpcError } = await supabase.rpc('get_daily_phrase')

      if (rpcError) {
        setCurrentPhrase(null)
        setError(rpcError.message)
        return
      }

      const phrase = data?.[0] as SystemPhrase | undefined
      if (!phrase) {
        setCurrentPhrase(null)
        setError(NO_PHRASES_ERROR)
        return
      }

      setCurrentPhrase(phrase)
    } catch (err) {
      setCurrentPhrase(null)
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDailyPhrase()
  }, [loadDailyPhrase])

  useEffect(() => {
    if (!userId) {
      setMyPhrases([])
      setSharedPhrases([])
      setBlockedUsers([])
      setLoadingUserPhrases(false)
      setLoadingBlockedUsers(false)
      setBlockedRpcMissing(false)
      return
    }

    const fetchId = ++fetchIdRef.current
    let cancelled = false

    async function loadUserPhrases() {
      setLoadingUserPhrases(true)
      setLoadingBlockedUsers(true)
      try {
        const supabase = createSupabaseClient()

        let rpcMissing = false

        const [blockedSenderIds, blockedUsersResult] = await Promise.all([
          getBlockedSenderIds(userId!),
          getBlockedUsers().catch((err) => {
            const message = err instanceof Error ? err.message : ''
            if (
              message.includes('get_my_blocked_users') ||
              message.includes('Could not find the function')
            ) {
              rpcMissing = true
            }
            return [] as BlockedUser[]
          }),
        ])

        if (cancelled || fetchId !== fetchIdRef.current) return

        setBlockedUsers(blockedUsersResult)
        setBlockedRpcMissing(rpcMissing)

        const [ownResult, sharedResult] = await Promise.all([
          supabase
            .from('user_phrases')
            .select('id, author_id, phrase_text, category, created_at')
            .eq('author_id', userId)
            .order('created_at', { ascending: false }),
          supabase
            .from('shared_phrases')
            .select(`
              id,
              phrase_id,
              sender_id,
              recipient_id,
              shared_at,
              user_phrases ( phrase_text, category ),
              profiles!sender_id ( full_name, username )
            `)
            .eq('recipient_id', userId)
            .order('shared_at', { ascending: false }),
        ])

        if (cancelled || fetchId !== fetchIdRef.current) return

        setMyPhrases(ownResult.data ?? [])

        const mapped: SharedPhrase[] = (sharedResult.data ?? [])
          .filter((row: Record<string, unknown>) => {
            const senderId = row.sender_id as string
            return !blockedSenderIds.includes(senderId)
          })
          .map((row: Record<string, unknown>) => {
          const up = row.user_phrases as { phrase_text: string; category: string } | null
          const sender = row.profiles as { full_name: string | null; username: string } | null
          return {
            id: row.id as string,
            phrase_id: row.phrase_id as string,
            sender_id: row.sender_id as string,
            recipient_id: row.recipient_id as string,
            shared_at: row.shared_at as string,
            phrase_text: up?.phrase_text ?? '',
            category: up?.category ?? 'general',
            sender_name: sender?.full_name?.trim() || sender?.username || 'Usuario',
          }
        })

        setSharedPhrases(mapped)
      } catch (err) {
        if (!cancelled && fetchId === fetchIdRef.current) {
          console.error('Error loading user phrases:', err)
        }
      } finally {
        if (!cancelled && fetchId === fetchIdRef.current) {
          setLoadingUserPhrases(false)
          setLoadingBlockedUsers(false)
        }
      }
    }

    loadUserPhrases()

    return () => {
      cancelled = true
    }
  }, [userId, phrasesRefreshKey])

  const displayText = currentPhrase
    ? lang === 'es'
      ? currentPhrase.phrase_es
      : currentPhrase.phrase_en
    : ''

  const displayError =
    error === NO_PHRASES_ERROR ? copy.noPhrasesAvailable : error

  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,_#fdf8f8_0%,_#F9F8F4_50%,_#f6f0e8_100%)] px-6 py-14 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-6xl">

        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h1 className="font-display text-4xl text-earth-900 md:text-5xl lg:text-6xl">
              {copy.heroTitle}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-earth-600 md:text-base">
              {copy.heroSubtitle1}
              <br className="hidden sm:block" />
              {copy.heroSubtitle2}
            </p>
          </div>

          <div className="relative min-h-[380px] overflow-hidden rounded-[2rem] shadow-[0_20px_60px_rgba(53,41,35,0.18)] sm:min-h-[420px] md:min-h-[460px]">
            <Image
              src="/fondo_frases.png"
              alt=""
              fill
              priority
              className="object-cover"
              sizes="(max-width: 896px) 100vw, 896px"
            />
            <div className="absolute inset-0 bg-earth-950/10" />

            <div className="relative z-10 flex min-h-[380px] items-center justify-center p-6 sm:min-h-[420px] sm:p-10 md:min-h-[460px]">
              <div className="relative w-full max-w-xl rounded-[1.75rem] border border-white/50 bg-white/75 px-6 py-8 text-center shadow-[0_8px_40px_rgba(53,41,35,0.12)] backdrop-blur-md sm:px-10 sm:py-10">

                {currentPhrase && !loading && !error && (
                  <span className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-rose-500">
                    {getCategoryLabel(currentPhrase.category, lang)}
                  </span>
                )}

                {loading ? (
                  <p className="mt-2 font-display text-xl text-earth-500">
                    {copy.loadingPhrase}
                  </p>
                ) : error ? (
                  <div className="mt-2 space-y-4">
                    <p className="font-display text-lg text-rose-500">
                      {error === NO_PHRASES_ERROR ? displayError : copy.loadError}
                    </p>
                    {error !== NO_PHRASES_ERROR && (
                      <p className="text-xs text-earth-500">{displayError}</p>
                    )}
                    {error.includes('permission denied') && (
                      <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-left text-xs leading-6 text-earth-600">
                        {copy.permissionHint}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={loadDailyPhrase}
                      className="rounded-full bg-earth-800 px-5 py-2 text-sm font-semibold text-white transition hover:bg-earth-900"
                    >
                      {copy.retry}
                    </button>
                  </div>
                ) : currentPhrase ? (
                  <p className="mt-2 px-2 py-2 font-display text-2xl font-bold italic leading-relaxed tracking-tight text-[#4a2c2a] sm:text-3xl md:text-4xl">
                    &ldquo;{displayText}&rdquo;
                  </p>
                ) : null}

                <p className="mt-5 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-earth-500">
                  — AMARÁ
                </p>
              </div>
            </div>
          </div>
        </div>

        {!user && (
          <p className="mx-auto mt-10 max-w-2xl text-center text-sm leading-7 text-earth-600">
            {copy.guestCta}{' '}
            <Link href={loginPath(pathname)} className="font-semibold text-rose-400 hover:underline">
              {copy.createAccount}
            </Link>{' '}
            {copy.or}{' '}
            <Link href={loginPath(pathname)} className="font-semibold text-rose-400 hover:underline">
              {copy.signIn}
            </Link>
            .
          </p>
        )}

        {user && (
          <div className="mt-16 space-y-14">
            <section>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl text-earth-900">{copy.myPhrasesTitle}</h2>
                  <p className="mt-2 text-sm text-earth-500">{copy.myPhrasesDesc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(true)}
                  className="rounded-full bg-rose-300 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-400"
                >
                  {copy.createPhrase}
                </button>
              </div>

              {loadingUserPhrases ? (
                <p className="text-sm text-earth-500">{copy.loadingMyPhrases}</p>
              ) : myPhrases.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-earth-200 bg-white/60 px-6 py-10 text-center text-sm text-earth-500">
                  {copy.emptyMyPhrases}
                </p>
              ) : (
                <div className="grid gap-5 text-2xl sm:grid-cols-2 lg:grid-cols-3">
                  {myPhrases.map((phrase) => (
                    <UserPhraseCard
                      key={phrase.id}
                      phrase={phrase}
                      authorName={authorName}
                      onShare={setPhraseToShare}
                    />
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-8">
                <h2 className="font-display text-3xl text-earth-900">{copy.sharedTitle}</h2>
                <p className="mt-2 text-sm text-earth-500">{copy.sharedDesc}</p>
              </div>

              {blockMessage && (
                <p className="mb-4 rounded-xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-700">
                  {blockMessage}
                </p>
              )}

              {loadingUserPhrases ? (
                <p className="text-sm text-earth-500">{copy.loadingShared}</p>
              ) : sharedPhrases.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-earth-200 bg-white/60 px-6 py-10 text-center text-sm text-earth-500">
                  {copy.emptyShared}
                </p>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {sharedPhrases.map((phrase) => (
                    <SharedPhraseCard
                      key={phrase.id}
                      phrase={phrase}
                      onBlock={handleBlockSender}
                      blocking={blockingSenderId === phrase.sender_id}
                    />
                  ))}
                </div>
              )}
            </section>

            <BlockedUsersSection
              users={blockedUsers}
              loading={loadingBlockedUsers}
              unblockingId={unblockingId}
              message={unblockMessage}
              showRpcHint={blockedRpcMissing && blockedUsers.length === 0}
              onUnblock={handleUnblock}
            />
          </div>
        )}
      </div>

      {showCreateForm && user && (
        <CreatePhraseForm
          userId={user.id}
          onClose={() => setShowCreateForm(false)}
          onCreated={refreshUserPhrases}
        />
      )}

      {phraseToShare && user && (
        <SharePhraseDialog
          phrase={phraseToShare}
          senderId={user.id}
          onClose={() => setPhraseToShare(null)}
          onShared={refreshUserPhrases}
        />
      )}
    </section>
  )
}
