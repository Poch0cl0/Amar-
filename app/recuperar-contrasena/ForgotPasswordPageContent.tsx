'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AuthPageShell } from '@/components/auth/AuthPageShell'
import {
  authErrorBoxClass,
  authInputClass,
  authPrimaryButtonClass,
} from '@/components/auth/auth-form-styles'
import { useLocale } from '@/components/providers/LocaleProvider'
import { sendPasswordResetEmail } from '@/lib/auth-password'
import { loginPath } from '@/lib/auth-redirect'
import { getTranslations, t } from '@/lib/i18n'

function friendlyRecoveryError(message: string, lang: 'es' | 'en'): string {
  const copy = getTranslations(lang).passwordRecovery
  const lower = message.toLowerCase()

  if (lower.includes('rate limit') || lower.includes('too many')) {
    return copy.rateLimitError
  }

  if (lower.includes('email') && lower.includes('invalid')) {
    return lang === 'es' ? 'Ingresa un correo válido.' : 'Enter a valid email.'
  }

  return message
}

export function ForgotPasswordPageContent() {
  const { lang } = useLocale()
  const loginCopy = getTranslations(lang).login
  const copy = getTranslations(lang).passwordRecovery

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await sendPasswordResetEmail(email)
      setSent(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : copy.unexpectedError
      setError(friendlyRecoveryError(message, lang))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthPageShell serenityLabel={loginCopy.serenity}>
      {sent ? (
        <div className="space-y-6 text-center">
          <div className="space-y-3">
            <h1 className="font-display text-3xl text-earth-900">{copy.emailSentTitle}</h1>
            <p className="text-sm leading-relaxed text-earth-600">
              {t(lang, 'passwordRecovery.emailSentDescription', { email })}
            </p>
            <p className="text-xs text-earth-500">{copy.emailSentHint}</p>
          </div>

          <Link
            href={loginPath('/')}
            className={`${authPrimaryButtonClass} inline-block text-center`}
          >
            {copy.backToLogin}
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8 space-y-3 text-center">
            <h1 className="font-display text-3xl text-earth-900">{copy.requestTitle}</h1>
            <p className="text-sm leading-relaxed text-earth-600">{copy.requestDescription}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-earth-700">{loginCopy.email}</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={loginCopy.emailPlaceholder}
                className={authInputClass}
              />
            </label>

            {error && <div className={authErrorBoxClass}>{error}</div>}

            <button type="submit" disabled={loading} className={authPrimaryButtonClass}>
              {loading ? copy.sending : copy.sendLink}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-earth-500">
            <Link href={loginPath('/')} className="font-medium text-rose-500 transition hover:text-rose-600">
              {copy.backToLogin}
            </Link>
          </p>
        </>
      )}
    </AuthPageShell>
  )
}
