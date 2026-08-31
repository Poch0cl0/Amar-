'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AuthPageShell } from '@/components/auth/AuthPageShell'
import { PasswordInput } from '@/components/auth/PasswordInput'
import {
  authErrorBoxClass,
  authPrimaryButtonClass,
} from '@/components/auth/auth-form-styles'
import { useLocale } from '@/components/providers/LocaleProvider'
import { updatePasswordAfterRecovery } from '@/lib/auth-password'
import { loginPath } from '@/lib/auth-redirect'
import { getTranslations } from '@/lib/i18n'
import { createSupabaseClient } from '@/lib/supabase'

export function ResetPasswordPageContent() {
  const router = useRouter()
  const { lang } = useLocale()
  const loginCopy = getTranslations(lang).login
  const copy = getTranslations(lang).passwordRecovery

  const [checking, setChecking] = useState(true)
  const [hasRecoverySession, setHasRecoverySession] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseClient()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setHasRecoverySession(true)
        setChecking(false)
      }
    })

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setHasRecoverySession(true)
      }
      setChecking(false)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError(loginCopy.passwordTooShort)
      return
    }

    if (password !== confirmPassword) {
      setError(loginCopy.passwordsMismatch)
      return
    }

    setLoading(true)

    try {
      await updatePasswordAfterRecovery(password)
      setSuccess(true)

      const supabase = createSupabaseClient()
      await supabase.auth.signOut()
    } catch (err) {
      const message = err instanceof Error ? err.message : copy.updateError
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <AuthPageShell serenityLabel={loginCopy.serenity}>
        <p className="text-center text-sm text-earth-500">{copy.checkingLink}</p>
      </AuthPageShell>
    )
  }

  if (!hasRecoverySession && !success) {
    return (
      <AuthPageShell serenityLabel={loginCopy.serenity}>
        <div className="space-y-6 text-center">
          <div className="space-y-3">
            <h1 className="font-display text-3xl text-earth-900">{copy.invalidLinkTitle}</h1>
            <p className="text-sm leading-relaxed text-earth-600">{copy.invalidLinkDescription}</p>
          </div>

          <Link href="/recuperar-contrasena" className={`${authPrimaryButtonClass} inline-block text-center`}>
            {copy.requestNewLink}
          </Link>

          <p className="text-sm text-earth-500">
            <Link href={loginPath('/')} className="font-medium text-rose-500 transition hover:text-rose-600">
              {copy.backToLogin}
            </Link>
          </p>
        </div>
      </AuthPageShell>
    )
  }

  if (success) {
    return (
      <AuthPageShell serenityLabel={loginCopy.serenity}>
        <div className="space-y-6 text-center">
          <div className="space-y-3">
            <h1 className="font-display text-3xl text-earth-900">{copy.successTitle}</h1>
            <p className="text-sm leading-relaxed text-earth-600">{copy.successDescription}</p>
          </div>

          <button
            type="button"
            onClick={() => router.push(loginPath('/'))}
            className={authPrimaryButtonClass}
          >
            {copy.goToLogin}
          </button>
        </div>
      </AuthPageShell>
    )
  }

  return (
    <AuthPageShell serenityLabel={loginCopy.serenity}>
      <div className="mb-8 space-y-3 text-center">
        <h1 className="font-display text-3xl text-earth-900">{copy.updateTitle}</h1>
        <p className="text-sm leading-relaxed text-earth-600">{copy.updateDescription}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-earth-700">{copy.newPassword}</span>
          <PasswordInput
            id="recovery-password"
            value={password}
            onChange={setPassword}
            placeholder={loginCopy.passwordMinPlaceholder}
            lang={lang}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-earth-700">{copy.confirmPassword}</span>
          <PasswordInput
            id="recovery-confirm-password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder={loginCopy.confirmPlaceholder}
            lang={lang}
          />
        </label>

        {error && <div className={authErrorBoxClass}>{error}</div>}

        <button type="submit" disabled={loading} className={authPrimaryButtonClass}>
          {loading ? copy.updating : copy.updatePassword}
        </button>
      </form>
    </AuthPageShell>
  )
}
