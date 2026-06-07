'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { SettingsGuestCTA } from '@/components/configuracion/SettingsGuestCTA'
import { useLocale } from '@/components/providers/LocaleProvider'
import { loginPath } from '@/lib/auth-redirect'
import { getTranslations } from '@/lib/i18n'
import {
  changePassword,
  fetchUserProfile,
  getProfileAvatarUrl,
  getProfileDisplayName,
  getAvatarErrorMessage,
  getProfileErrorMessage,
  saveUserProfile,
  uploadAvatar,
} from '@/lib/profile'
import { createSupabaseClient } from '@/lib/supabase'

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return parts[0]?.slice(0, 2).toUpperCase() ?? '?'
}

export function ConfiguracionPageContent() {
  const { lang } = useLocale()
  const copy = getTranslations(lang).configuracion

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [profileSaving, setProfileSaving] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const supabase = createSupabaseClient()

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    fetchUserProfile(user.id)
      .then((data) => {
        if (cancelled) return

        setEmail(user.email ?? '')
        setFullName(getProfileDisplayName(data, user.user_metadata, user.email))
        setBio(data?.bio ?? '')
        setLocation(data?.location ?? '')
        const avatar = getProfileAvatarUrl(data, user.user_metadata)
        setAvatarUrl(avatar)
        setAvatarPreview(avatar)
      })
      .catch(() => {
        if (!cancelled) {
          setProfileError(copy.loadError)
          setFullName(getProfileDisplayName(null, user.user_metadata, user.email))
          setEmail(user.email ?? '')
          setAvatarPreview(getProfileAvatarUrl(null, user.user_metadata))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user, copy.loadError])

  async function handleAvatarChange(file: File | null) {
    if (!file || !user) return

    if (!file.type.startsWith('image/')) {
      setProfileError(copy.avatarInvalid)
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      setProfileError(copy.avatarTooLarge)
      return
    }

    setProfileError('')
    setAvatarUploading(true)

    try {
      const localPreview = URL.createObjectURL(file)
      setAvatarPreview(localPreview)

      const publicUrl = await uploadAvatar(user.id, file)
      setAvatarUrl(publicUrl)
      setAvatarPreview(publicUrl)

      await saveUserProfile(
        user.id,
        {
          fullName,
          bio,
          location,
          avatarUrl: publicUrl,
        },
        { email: user.email },
      )

      setProfileMessage(copy.avatarUpdated)
    } catch (err) {
      setProfileError(getAvatarErrorMessage(err, copy))
      setAvatarPreview(avatarUrl)
    } finally {
      setAvatarUploading(false)
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user || profileSaving) return

    setProfileSaving(true)
    setProfileMessage('')
    setProfileError('')

    try {
      await saveUserProfile(
        user.id,
        {
          fullName,
          bio,
          location,
          avatarUrl,
        },
        { email: user.email },
      )
      setProfileMessage(copy.profileSaved)
    } catch (err) {
      setProfileError(getProfileErrorMessage(err, copy))
    } finally {
      setProfileSaving(false)
    }
  }

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.email || passwordSaving) return

    setPasswordMessage('')
    setPasswordError('')

    if (newPassword.length < 6) {
      setPasswordError(copy.passwordTooShort)
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(copy.passwordsMismatch)
      return
    }

    setPasswordSaving(true)

    try {
      await changePassword({
        email: user.email,
        currentPassword,
        newPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMessage(copy.passwordUpdated)
    } catch (err) {
      if (err instanceof Error && err.message === 'INVALID_CURRENT_PASSWORD') {
        setPasswordError(copy.invalidCurrentPassword)
      } else {
        setPasswordError(copy.passwordUpdateError)
      }
    } finally {
      setPasswordSaving(false)
    }
  }

  const displayName = fullName || email
  const initials = getInitials(displayName)

  return (
    <section className="bg-[linear-gradient(180deg,_#fdf8f8_0%,_#F9F8F4_50%,_#f6f0e8_100%)] px-6 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-4xl">
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-400">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 font-display text-4xl text-earth-900 md:text-5xl">{copy.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-earth-600">
            {copy.subtitle}
          </p>
        </header>

        <div className="mx-auto mt-8 max-w-2xl border-b border-rose-200/60" />

        <div className="mt-10 space-y-8">
          {!user ? (
            <SettingsGuestCTA />
          ) : loading ? (
            <p className="text-center text-sm text-earth-500">{copy.loading}</p>
          ) : (
            <>
              <form
                onSubmit={handleSaveProfile}
                className="rounded-3xl border border-earth-100 bg-white p-6 shadow-card md:p-8"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-start">
                  <div className="relative mx-auto shrink-0 md:mx-0">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-rose-200 bg-rose-50 text-2xl font-semibold text-rose-500">
                      {avatarPreview ? (
                        <Image
                          src={avatarPreview}
                          alt={displayName}
                          width={112}
                          height={112}
                          unoptimized
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-earth-800 text-white shadow-sm transition hover:bg-earth-900 disabled:opacity-60"
                      aria-label={copy.changePhoto}
                    >
                      <CameraIcon />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleAvatarChange(e.target.files?.[0] ?? null)}
                    />
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h2 className="font-display text-3xl text-earth-900">{copy.personalTitle}</h2>
                    <p className="mt-1 text-sm text-earth-500">{copy.personalSubtitle}</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="mt-4 rounded-full bg-rose-100 px-5 py-2 text-sm font-semibold text-earth-800 transition hover:bg-rose-200 disabled:opacity-60"
                    >
                      {avatarUploading ? copy.uploadingPhoto : copy.changePhoto}
                    </button>
                  </div>
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-earth-500">
                      {copy.fullName}
                    </span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-earth-200 bg-cream px-4 py-3 text-sm text-earth-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-earth-500">
                      {copy.email}
                    </span>
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="w-full cursor-not-allowed rounded-xl border border-earth-200 bg-sand-50 px-4 py-3 text-sm text-earth-500 outline-none"
                    />
                  </label>
                </div>

                <label className="mt-5 block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-earth-500">
                    {copy.bio}
                  </span>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    placeholder={copy.bioPlaceholder}
                    className="w-full resize-none rounded-xl border border-earth-200 bg-cream px-4 py-3 text-sm text-earth-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                  />
                </label>

                <label className="mt-5 block space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-earth-500">
                    {copy.location}
                  </span>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-earth-400">
                      <LocationIcon />
                    </span>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder={copy.locationPlaceholder}
                      className="w-full rounded-xl border border-earth-200 bg-cream py-3 pl-11 pr-4 text-sm text-earth-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    />
                  </div>
                </label>

                {profileError && (
                  <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                    {profileError}
                  </p>
                )}
                {profileMessage && (
                  <p className="mt-4 rounded-xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-700">
                    {profileMessage}
                  </p>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={profileSaving || avatarUploading}
                    className="rounded-full bg-earth-800 px-8 py-3 text-sm font-semibold text-white transition hover:bg-earth-900 disabled:opacity-60"
                  >
                    {profileSaving ? copy.saving : copy.saveProfile}
                  </button>
                </div>
              </form>

              <form
                onSubmit={handleUpdatePassword}
                className="rounded-3xl border border-earth-100 bg-white p-6 shadow-card md:p-8"
              >
                <h2 className="font-display text-3xl text-earth-900">{copy.securityTitle}</h2>
                <p className="mt-1 text-sm text-earth-500">{copy.securitySubtitle}</p>
                <div className="mt-6 border-t border-earth-100 pt-6" />

                <div className="grid gap-5 md:grid-cols-3">
                  <label className="block space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-earth-500">
                      {copy.currentPassword}
                    </span>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full rounded-xl border border-earth-200 bg-cream px-4 py-3 text-sm text-earth-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-earth-500">
                      {copy.newPassword}
                    </span>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-earth-200 bg-cream px-4 py-3 text-sm text-earth-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    />
                  </label>

                  <label className="block space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-earth-500">
                      {copy.confirmPassword}
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-earth-200 bg-cream px-4 py-3 text-sm text-earth-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    />
                  </label>
                </div>

                {passwordError && (
                  <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                    {passwordError}
                  </p>
                )}
                {passwordMessage && (
                  <p className="mt-4 rounded-xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-700">
                    {passwordMessage}
                  </p>
                )}

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-earth-500">
                    {copy.forgotPassword}{' '}
                    <Link href={loginPath('/configuracion')} className="text-rose-500 hover:underline">
                      {copy.resetHere}
                    </Link>
                  </p>
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="rounded-full bg-earth-800 px-8 py-3 text-sm font-semibold text-white transition hover:bg-earth-900 disabled:opacity-60"
                  >
                    {passwordSaving ? copy.updatingPassword : copy.updatePassword}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function CameraIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
