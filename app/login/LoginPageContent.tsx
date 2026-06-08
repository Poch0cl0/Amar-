'use client'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useLocale } from '@/components/providers/LocaleProvider'
import { safeRedirect } from '@/lib/auth-redirect'
import { getClientSiteUrl } from '@/lib/site-url'
import type { Lang } from '@/lib/i18n'
import { friendlyLoginError, getTranslations, t } from '@/lib/i18n'
import { createSupabaseClient } from '@/lib/supabase'

type Tab = 'login' | 'registro'

const inputClass =
  'w-full rounded-2xl border border-rose-100 bg-[#FFF3F3] px-4 py-3.5 text-sm text-earth-900 placeholder:text-earth-400 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100'

function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  lang,
  required = true,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  lang: Lang
  required?: boolean
}) {
  const [visible, setVisible] = useState(false)
  const loginCopy = getTranslations(lang).login

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-400 transition hover:text-earth-600"
        aria-label={visible ? loginCopy.hidePassword : loginCopy.showPassword}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  )
}

function EyeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1 1 0 010-.644C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  )
}

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
  const authError = searchParams.get('error') === 'auth'
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
  const [regSuccess, setRegSuccess] = useState(false)
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
      const { error } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: {
          data: {
            full_name: regFullName.trim(),
          },
          emailRedirectTo: `${getClientSiteUrl()}/auth/callback`,
        },
      })
      if (error) {
        setRegError(friendlyLoginError(error.message, lang))
      } else {
        setRegSuccess(true)
      }
    } catch {
      setRegError(copy.unexpectedError)
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <section className="px-6 py-12 sm:py-16 lg:px-8">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center text-center">
          <Image
            src="/logo-amara.png"
            alt="Amará"
            width={1536}
            height={1024}
            unoptimized
            className="h-24 w-auto object-contain sm:h-28"
            priority
          />
          <p className="mt-1 text-[0.65rem] font-semibold tracking-[0.35em] text-earth-500">
            {copy.serenity}
          </p>
        </div>

        <LoginTabs
          tab={tab}
          onChange={(next) => {
            setTab(next)
            setLoginError('')
            setRegError('')
            if (next === 'login') setRegSuccess(false)
          }}
          loginLabel={copy.tabLogin}
          registerLabel={copy.tabRegister}
        />

        {tab === 'login' && authError && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {copy.authCallbackError}
          </div>
        )}

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
                className={inputClass}
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
              {copy.forgotPassword}
            </p>

            {loginError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-500">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-full bg-[#C8A0A0] py-3.5 text-sm font-semibold text-earth-900 transition hover:bg-[#b89090] active:scale-[0.99] disabled:opacity-60"
            >
              {loginLoading ? copy.signingIn : copy.enter}
            </button>
          </form>
        )}

        {tab === 'registro' && !regSuccess && (
          <form onSubmit={handleRegistro} className="space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-earth-700">{copy.name}</span>
              <input
                type="text"
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder={copy.namePlaceholder}
                className={inputClass}
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
                className={inputClass}
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

            {regError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-500">
                {regError}
              </div>
            )}

            <button
              type="submit"
              disabled={regLoading}
              className="w-full rounded-full bg-[#C8A0A0] py-3.5 text-sm font-semibold text-earth-900 transition hover:bg-[#b89090] active:scale-[0.99] disabled:opacity-60"
            >
              {regLoading ? copy.creating : copy.createAccount}
            </button>
          </form>
        )}

        {tab === 'registro' && regSuccess && (
          <div className="space-y-6 py-2 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
              <svg className="h-8 w-8 text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0-9.75 6.75L2.25 6.75" />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="font-display text-2xl text-earth-900">{copy.almostReady}</p>
              <p className="text-sm leading-relaxed text-earth-500">
                {t(lang, 'login.confirmEmailSent', { email: regEmail })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setTab('login'); setRegSuccess(false) }}
              className="w-full rounded-full bg-[#C8A0A0] py-3.5 text-sm font-semibold text-earth-900 transition hover:bg-[#b89090]"
            >
              {copy.goToLogin}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
