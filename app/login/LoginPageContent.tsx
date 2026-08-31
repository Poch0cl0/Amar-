'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { AuthPageShell } from '@/components/auth/AuthPageShell'
import { PasswordInput } from '@/components/auth/PasswordInput'
import {
  authErrorBoxClass,
  authInputClass,
  authPrimaryButtonClass,
} from '@/components/auth/auth-form-styles'
import { useLocale } from '@/components/providers/LocaleProvider'
import { safeRedirect } from '@/lib/auth-redirect'
import type { Lang } from '@/lib/i18n'
import { friendlyLoginError, getTranslations } from '@/lib/i18n'
import { createSupabaseClient } from '@/lib/supabase'

type Tab = 'login' | 'registro'

function LoginTabs({
  tab,
  onChange,
  loginLabel,
  registerLabel,
}: {
  tab: Tab
  onChange: (tab: Tab) => void
  loginLabel: string
  registerLabel: string
}) {
  return (
    <div className="mb-8 flex border-b border-earth-200">
      <button
        type="button"
        onClick={() => onChange('login')}
        className={`flex-1 border-b-2 pb-3 text-center text-sm font-medium transition ${
          tab === 'login'
            ? 'border-earth-800 text-earth-900'
            : 'border-transparent text-earth-500'
        }`}
      >
        {loginLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange('registro')}
        className={`flex-1 border-b-2 pb-3 text-center text-sm font-medium transition ${
          tab === 'registro'
            ? 'border-earth-800 text-earth-900'
            : 'border-transparent text-earth-500'
        }`}
      >
        {registerLabel}
      </button>
    </div>
  )
}

export function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang } = useLocale()
  const copy = getTranslations(lang).login

  const redirectTo = safeRedirect(searchParams.get('redirect'))
  const [tab, setTab] = useState<Tab>('login')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regFullName, setRegFullName] = useState('')
  const [regError, setRegError] = useState('')
  const [regLoading, setRegLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    try {
      const supabase = createSupabaseClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      })
      if (error) {
        setLoginError(friendlyLoginError(error.message, lang))
      } else {
        router.push(redirectTo)
      }
    } catch {
      setLoginError(copy.unexpectedError)
    } finally {
      setLoginLoading(false)
    }
  }

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault()
    setRegError('')

    if (regPassword !== regConfirm) {
      setRegError(copy.passwordsMismatch)
      return
    }
    if (regPassword.length < 6) {
      setRegError(copy.passwordTooShort)
      return
    }
    if (!regFullName.trim()) {
      setRegError(copy.nameRequired)
      return
    }

    setRegLoading(true)
    try {
      const supabase = createSupabaseClient()
      const { data, error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: {
            full_name: regFullName.trim(),
          },
        },
      })
      if (error) {
        const isServerError =
          error.status === 500 ||
          /hook|email|smtp|send.*mail/i.test(error.message)
        setRegError(
          isServerError ? copy.signupServerError : friendlyLoginError(error.message, lang),
        )
      } else if (data.session) {
        router.push(redirectTo)
      } else {
        setRegError(copy.signupNoSession)
      }
    } catch {
      setRegError(copy.unexpectedError)
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <AuthPageShell serenityLabel={copy.serenity}>
      <LoginTabs
        tab={tab}
        onChange={(next) => {
          setTab(next)
          setLoginError('')
          setRegError('')
        }}
        loginLabel={copy.tabLogin}
        registerLabel={copy.tabRegister}
      />

      {tab === 'login' && (
        <form onSubmit={handleLogin} className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-earth-700">{copy.email}</span>
            <input
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder={copy.emailPlaceholder}
              className={authInputClass}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-earth-700">{copy.password}</span>
            <PasswordInput
              id="login-password"
              value={loginPassword}
              onChange={setLoginPassword}
              placeholder={copy.passwordPlaceholder}
              lang={lang}
            />
          </label>

          <p className="text-right text-xs text-earth-500">
            {copy.forgotPassword}{' '}
            <Link href="/recuperar-contrasena" className="font-medium text-rose-500 hover:underline">
              {copy.recoverHere}
            </Link>
          </p>

          {loginError && <div className={authErrorBoxClass}>{loginError}</div>}

          <button type="submit" disabled={loginLoading} className={authPrimaryButtonClass}>
            {loginLoading ? copy.signingIn : copy.enter}
          </button>
        </form>
      )}

      {tab === 'registro' && (
        <form onSubmit={handleRegistro} className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-earth-700">{copy.name}</span>
            <input
              type="text"
              required
              value={regFullName}
              onChange={(e) => setRegFullName(e.target.value)}
              placeholder={copy.namePlaceholder}
              className={authInputClass}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-earth-700">{copy.email}</span>
            <input
              type="email"
              required
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              placeholder={copy.emailPlaceholder}
              className={authInputClass}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-earth-700">{copy.password}</span>
            <PasswordInput
              id="reg-password"
              value={regPassword}
              onChange={setRegPassword}
              placeholder={copy.passwordMinPlaceholder}
              lang={lang}
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-earth-700">{copy.confirmPassword}</span>
            <PasswordInput
              id="reg-confirm-password"
              value={regConfirm}
              onChange={setRegConfirm}
              placeholder={copy.confirmPlaceholder}
              lang={lang}
            />
          </label>

          {regError && <div className={authErrorBoxClass}>{regError}</div>}

          <button type="submit" disabled={regLoading} className={authPrimaryButtonClass}>
            {regLoading ? copy.creating : copy.createAccount}
          </button>
        </form>
      )}
    </AuthPageShell>
  )
}
