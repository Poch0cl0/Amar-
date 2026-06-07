'use client'

import { useState } from 'react'
import { useLocale } from '@/components/providers/LocaleProvider'
import { getTranslations, t } from '@/lib/i18n'
import { isUserBlockedBy, type UserPhrase } from '@/lib/frases'
import { createSupabaseClient } from '@/lib/supabase'

type SharePhraseDialogProps = {
  phrase: UserPhrase
  senderId: string
  onClose: () => void
  onShared: () => void
}

export function SharePhraseDialog({ phrase, senderId, onClose, onShared }: SharePhraseDialogProps) {
  const { lang } = useLocale()
  const copy = getTranslations(lang).frases

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email.trim()) {
      setError(copy.enterEmail)
      return
    }

    setLoading(true)
    try {
      const supabase = createSupabaseClient()

      const { data: found, error: findError } = await supabase.rpc('find_user_by_email', {
        p_email: email.trim(),
      })

      if (findError) {
        setError(findError.message)
        return
      }

      const recipient = found?.[0]
      if (!recipient) {
        setError(copy.userNotFound)
        return
      }

      if (recipient.user_id === senderId) {
        setError(copy.cannotShareToSelf)
        return
      }

      const blocked = await isUserBlockedBy(recipient.user_id, senderId)
      if (blocked) {
        setError(copy.recipientBlockedYou)
        return
      }

      const { error: shareError } = await supabase.from('shared_phrases').insert({
        phrase_id: phrase.id,
        sender_id: senderId,
        recipient_id: recipient.user_id,
      })

      if (shareError) {
        if (shareError.code === '23505') {
          setError(copy.alreadyShared)
        } else {
          setError(shareError.message)
        }
        return
      }

      setSuccess(t(lang, 'frases.shareSuccess', { name: recipient.full_name }))
      onShared()
      setTimeout(onClose, 1200)
    } catch {
      setError(copy.shareError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-earth-950/40 px-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-md rounded-3xl border border-rose-200/60 bg-white p-8 shadow-soft"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-phrase-title"
      >
        <h2 id="share-phrase-title" className="font-display text-2xl italic text-earth-900">
          {copy.shareModalTitle}
        </h2>
        <p className="mt-2 text-sm text-earth-500">{copy.shareModalDesc}</p>

        <blockquote className="mt-4 rounded-xl border border-earth-100 bg-cream px-4 py-3 font-display text-sm italic text-earth-700">
          &ldquo;{phrase.phrase_text}&rdquo;
        </blockquote>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-earth-500">
              {copy.recipientEmail}
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={copy.emailPlaceholder}
              className="w-full rounded-xl border border-earth-200 bg-cream px-4 py-3 text-sm text-earth-900 placeholder:text-earth-300 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200"
            />
          </label>

          {error && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-500">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-700">
              {success}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-earth-200 px-4 py-3 text-sm font-medium text-earth-600 transition hover:bg-sand-50"
            >
              {copy.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-rose-300 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:opacity-60"
            >
              {loading ? copy.sharing : copy.share}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
